import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'PATIENT' | 'MEDECIN' | 'ADMIN' | 'RECEPTIONNISTE';
    specialite?: string;
    dateNaissance?: string;
    antecedents?: string;
  }) {
    // Vérifie si un utilisateur avec cet email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà.');
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Transaction pour garantir la cohérence
    const result = await this.prisma.$transaction(async (tx) => {
      // Création du user
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });

      // Création selon le rôle
      switch (data.role) {
        case 'MEDECIN':
          if (!data.specialite) {
            throw new Error('La spécialité du médecin est requise.');
          }
          await tx.medecin.create({
            data: {
              userId: user.id,
              specialite: data.specialite,
            },
          });
          break;

        case 'PATIENT':
          await tx.patient.create({
            data: {
              userId: user.id,
              dateNaissance: data.dateNaissance
                ? new Date(data.dateNaissance)
                : new Date('2000-01-01'),
              antecedents: data.antecedents || '',
            },
          });
          break;

        case 'RECEPTIONNISTE':
          await tx.receptionniste.create({
            data: { userId: user.id },
          });
          break;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return result;
  }

  // 🔹 Trouver un utilisateur par email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // 🔹 Liste de tous les utilisateurs
  async getAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  // 🔹 Supprimer un utilisateur
  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
