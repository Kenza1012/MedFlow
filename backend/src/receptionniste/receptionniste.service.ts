import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReceptionnisteService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Créer un réceptionniste
  async createReceptionniste(userId: number) {
    return this.prisma.receptionniste.create({
      data: { userId },
      include: { user: true },
    });
  }

  // 🔹 Récupérer tous les réceptionnistes
  async findAll() {
    return this.prisma.receptionniste.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  // 🔹 Récupérer un réceptionniste par ID
  async findOne(id: number) {
    const receptionniste = await this.prisma.receptionniste.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!receptionniste)
      throw new NotFoundException('Réceptionniste non trouvé');
    return receptionniste;
  }

  // 🔹 Récupérer un réceptionniste par user ID
  async findByUserId(userId: number) {
    return this.prisma.receptionniste.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  // 🔹 Supprimer un réceptionniste
  async remove(id: number) {
    return this.prisma.receptionniste.delete({
      where: { id },
    });
  }

  // 🔹 GESTION DES RENDEZ-VOUS
  async createRendezVous(data: {
    date: Date;
    motif: string;
    patientId: number;
    medecinId: number;
  }) {
    return this.prisma.rendezVous.create({
      data: {
        date: data.date,
        motif: data.motif,
        patientId: data.patientId,
        medecinId: data.medecinId,
        status: 'Programmé',
      },
      include: {
        patient: { include: { user: true } },
        medecin: { include: { user: true } },
      },
    });
  }

  async updateRendezVous(
    id: number,
    data: { date?: Date; motif?: string; status?: string },
  ) {
    return this.prisma.rendezVous.update({
      where: { id },
      data,
      include: {
        patient: { include: { user: true } },
        medecin: { include: { user: true } },
      },
    });
  }

  async cancelRendezVous(id: number) {
    return this.prisma.rendezVous.update({
      where: { id },
      data: { status: 'Annulé' },
    });
  }

  async getAllRendezVous() {
    return this.prisma.rendezVous.findMany({
      include: {
        patient: { include: { user: true } },
        medecin: { include: { user: true } },
      },
      orderBy: { date: 'asc' },
    });
  }

  // 🔹 GESTION DES FACTURES
  async createFacture(data: {
    montant: number;
    patientId: number;
    consultationId?: number;
  }) {
    return this.prisma.facture.create({
      data: {
        montant: data.montant,
        patientId: data.patientId,
        consultationId: data.consultationId,
        statut: 'Non payé',
      },
      include: {
        patient: { include: { user: true } },
        consultation: true,
      },
    });
  }

  async getAllFactures() {
    return this.prisma.facture.findMany({
      include: {
        patient: { include: { user: true } },
        consultation: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async markFactureAsPaid(id: number) {
    return this.prisma.facture.update({
      where: { id },
      data: { statut: 'Payé' },
    });
  }

  async getFacturesByPatient(patientId: number) {
    return this.prisma.facture.findMany({
      where: { patientId },
      include: { consultation: true },
    });
  }

  // 🔹 NOUVEAUX ENDPOINTS : Récupérer tous les patients
  async getAllPatients() {
    return this.prisma.patient.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  // 🔹 NOUVEAUX ENDPOINTS : Récupérer tous les médecins
  async getAllMedecins() {
    return this.prisma.medecin.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  // 🔹 NOUVEAUX ENDPOINTS : Récupérer toutes les consultations
  async getAllConsultations() {
    return this.prisma.consultation.findMany({
      include: {
        patient: { include: { user: true } },
        medecin: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    });
  }
}