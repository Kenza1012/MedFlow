import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';




@Injectable()
export class MedecinService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Trouver un médecin via le userId
  async findByUserId(userId: number) {
    return this.prisma.medecin.findUnique({
      where: { userId },
    });
  }

  

  // 🔹 Obtenir tous les rendez-vous d'un médecin
  async getRendezVous(medecinId: number) {
    return this.prisma.rendezVous.findMany({
      where: { medecinId },
      include: {
        patient: { include: { user: true } },
      },
    });
  }

  // 🔹 Ajouter une consultation
  async addConsultation(
    medecinId: number,
    data: { patientId: number; diagnostic: string; prescription?: string }
  ) {
    const { patientId, diagnostic, prescription } = data;

    // Vérifier si le médecin existe
    const medecin = await this.prisma.medecin.findUnique({ where: { id: medecinId } });
    if (!medecin) throw new NotFoundException('Médecin non trouvé');

    // Vérifier si le patient existe
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient non trouvé');

    // Créer la consultation
    return this.prisma.consultation.create({
      data: { medecinId, patientId, diagnostic, prescription },
    });
  }

  // 🔹 Obtenir toutes les consultations d'un médecin
  async getConsultations(medecinId: number) {
    return this.prisma.consultation.findMany({
      where: { medecinId },
      include: { patient: { include: { user: true } } },
    });
  }

  // 🔹 Générer une ordonnance PDF
  // src/medecin/medecin.service.ts
 async generateOrdonnancePDF(consultationId: number) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        patient: { include: { user: true } },
        medecin: { include: { user: true } },
      },
    });

    if (!consultation) throw new NotFoundException('Consultation non trouvée');

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => {});

    const patientName = consultation.patient?.user?.name ?? 'Inconnu';
    const medecinName = consultation.medecin?.user?.name ?? 'N/A';
    const date = consultation.date ? consultation.date.toDateString() : 'Date inconnue';

    doc.fontSize(20).text(' Ordonnance Médicale', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(` Patient : ${patientName}`);
    doc.text(` Médecin : ${medecinName}`);
    doc.text(` Date : ${date}`);
    doc.moveDown();
    doc.text(` Diagnostic : ${consultation.diagnostic ?? 'Non renseigné'}`);
    doc.text(` Prescription : ${consultation.prescription ?? 'Aucune'}`);

    doc.end();

    return new Promise<Buffer>((resolve) => {
      const result: Buffer[] = [];
      doc.on('data', (chunk) => result.push(Buffer.from(chunk)));
      doc.on('end', () => resolve(Buffer.concat(result)));
    });
  }

  // 🔹 Récupérer la liste de tous les médecins disponibles
async getAllMedecinsDisponibles() {
  return this.prisma.medecin.findMany({
    // ou supprime cette ligne si tu n’as pas de champ "disponible"
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

}