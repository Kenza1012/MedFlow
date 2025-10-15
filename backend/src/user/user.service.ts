import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Créer un nouvel utilisateur (inscription)
  async register(data: { name: string; email: string; password: string; role: string }) {
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
        role: data.role as 'PATIENT' | 'MEDECIN' | 'ADMIN',
      },
    });

    // On ne retourne pas le mot de passe
    const { password, ...result } = user;
    return result;
  }

  // 🔹 Trouver un utilisateur par email (utile pour le login)
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 🔹 Obtenir la liste de tous les utilisateurs (optionnel)
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

  // 🔹 Supprimer un utilisateur (optionnel)
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
