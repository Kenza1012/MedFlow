// patient.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: number; dateNaissance: Date; antecedents?: string }) {
    return this.prisma.patient.create({
      data,
      include: { user: true }
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { 
        user: true,
        rendezVous: {
          include: {
            medecin: {
              include: { user: true }
            }
          }
        },
        factures: true
      },
    });
    if (!patient) throw new NotFoundException('Patient non trouvé');
    return patient;
  }

  // 🔹 NOUVEAU : Trouver patient par userId
  async findByUserId(userId: number) {
    const patient = await this.prisma.patient.findFirst({
      where: { userId },
      include: { 
        user: true,
        rendezVous: {
          include: {
            medecin: {
              include: { user: true }
            }
          }
        },
        factures: true
      },
    });
    if (!patient) throw new NotFoundException('Patient non trouvé');
    return patient;
  }

  // 🔹 NOUVEAU : Récupérer les rendez-vous d'un patient
  async findRendezVous(patientId: number) {
    return this.prisma.rendezVous.findMany({
      where: { patientId },
      include: {
        medecin: {
          include: { user: true }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  // 🔹 NOUVEAU : Récupérer les factures d'un patient
  async findFactures(patientId: number) {
    return this.prisma.facture.findMany({
      where: { patientId },
      include: {
        consultation: true
      },
      orderBy: { date: 'desc' }
    });
  }

  async update(id: number, data: any) {
    return this.prisma.patient.update({
      where: { id },
      data,
      include: { user: true }
    });
  }

  async remove(id: number) {
    return this.prisma.patient.delete({
      where: { id },
    });
  }
}