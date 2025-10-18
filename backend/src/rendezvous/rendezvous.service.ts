import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RendezVousService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Patient crée un rendez-vous
  async createRendezVous(data: {
    date: string;
    motif: string;
    patientId: number;
    medecinId: number;
  }) {
    return this.prisma.rendezVous.create({
      data: {
        date: new Date(data.date),
        motif: data.motif,
        patientId: data.patientId,
        medecinId: data.medecinId,
      },
    });
  }

  // 🔹 Médecin liste ses rendez-vous
  async getRendezVousByMedecin(medecinId: number) {
    return this.prisma.rendezVous.findMany({
      where: { medecinId },
      include: { patient: { include: { user: true } } },
      orderBy: { date: 'asc' },
    });
  }

  // 🔹 Réceptionniste liste tous les rendez-vous
  async getAllRendezVous() {
    return this.prisma.rendezVous.findMany({
      include: {
        patient: { include: { user: true } },
        medecin: { include: { user: true } },
      },
      orderBy: { date: 'asc' },
    });
  }
}
