import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RendezVousService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Patient crée un rendez-vous
  async createRendezVous(data: {
    date: string;
    motif: string;
    userId: number;   // ✅ l'utilisateur connecté (patient)
    medecinId: number;
  }) {
    try {
      // 🔹 Vérification des champs
      if (!data.userId || !data.medecinId || !data.date || !data.motif) {
        throw new BadRequestException('Données incomplètes pour créer un rendez-vous');
      }

      // 🔹 Trouver le patient lié à cet utilisateur
      const patient = await this.prisma.patient.findUnique({
        where: { userId: Number(data.userId) },
      });

      if (!patient) {
        throw new NotFoundException(`Aucun patient trouvé pour l'utilisateur ${data.userId}`);
      }

      // 🔹 Création du rendez-vous
      const rendezVous = await this.prisma.rendezVous.create({
        data: {
          date: new Date(data.date),
          motif: data.motif,
          patient: { connect: { id: patient.id } },
          medecin: { connect: { id: Number(data.medecinId) } },
        },
        include: {
          patient: { include: { user: true } },
          medecin: { include: { user: true } },
        },
      });

      return rendezVous;
    } catch (error) {
      console.error('❌ Erreur création rendez-vous:', error);
      throw new BadRequestException(error.message || 'Erreur lors de la création du rendez-vous');
    }
  }

  // 🔹 Médecin liste ses rendez-vous
  async getRendezVousByMedecin(medecinId: number) {
    try {
      return await this.prisma.rendezVous.findMany({
        where: { medecinId: Number(medecinId) },
        include: {
          patient: { include: { user: true } },
        },
        orderBy: { date: 'asc' },
      });
    } catch (error) {
      console.error('❌ Erreur récupération rendez-vous médecin:', error);
      throw new BadRequestException('Erreur lors de la récupération des rendez-vous du médecin');
    }
  }

  // 🔹 Réceptionniste ou admin liste tous les rendez-vous
  async getAllRendezVous() {
    try {
      return await this.prisma.rendezVous.findMany({
        include: {
          patient: { include: { user: true } },
          medecin: { include: { user: true } },
        },
        orderBy: { date: 'asc' },
      });
    } catch (error) {
      console.error('❌ Erreur récupération de tous les rendez-vous:', error);
      throw new BadRequestException('Erreur lors de la récupération de tous les rendez-vous');
    }
  }
}
