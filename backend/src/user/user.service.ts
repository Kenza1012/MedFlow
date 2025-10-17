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
    role: string;
    specialite?: string; // pour le médecin
    dateNaissance?: string; // pour le patient
    antecedents?: string; // pour le patient
  }) {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà.');
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Création de l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as 'PATIENT' | 'MEDECIN' | 'ADMIN' | 'RECEPTIONNISTE',
      },
    });

    // 🔹 Création spécifique selon rôle
    if (user.role === 'MEDECIN') {
      if (!data.specialite) {
        throw new Error('La spécialité du médecin est requise.');
      }
      await this.prisma.medecin.create({
        data: {
          userId: user.id,
          specialite: data.specialite,
        },
      });
    }

    if (user.role === 'PATIENT') {
      await this.prisma.patient.create({
        data: {
          userId: user.id,
          dateNaissance: data.dateNaissance
            ? new Date(data.dateNaissance)
            : new Date('2000-01-01'),
          antecedents: data.antecedents || '',
        },
      });
    }

    // Ne retourne pas le mot de passe
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

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

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
