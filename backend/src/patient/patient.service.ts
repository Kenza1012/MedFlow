import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Créer un patient (lié à un utilisateur)
  async create(data: {
    userId: number;
    dateNaissance: Date;
    antecedents?: string;
  }) {
    return this.prisma.patient.create({
      data,
    });
  }

  // 🔹 Récupérer tous les patients
  async findAll() {
    return this.prisma.patient.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // 🔹 Récupérer un patient par ID
  async findOne(id: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!patient) throw new NotFoundException('Patient non trouvé');
    return patient;
  }

  // 🔹 Mettre à jour un patient
  async update(id: number, data: any) {
    return this.prisma.patient.update({
      where: { id },
      data,
    });
  }

  // 🔹 Supprimer un patient
  async remove(id: number) {
    return this.prisma.patient.delete({
      where: { id },
    });
  }
}
