import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';

@Injectable()
export class MedecinService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Obtenir tous les rendez-vous d'un médecin
  async getRendezVous(medecinId: number) {
    return this.prisma.rendezVous.findMany({
      where: { medecinId },
      include: {
        patient: {
          include: { user: true }, // Pour afficher le nom/email du patient
        },
      },
    });
  }

  // 🔹 Ajouter une consultation
  async addConsultation(data: {
    medecinId: number;
    patientId: number;
    diagnostic: string;
    prescription?: string; // ✅ correspond à ton schéma Prisma
  }) {
    const { medecinId, patientId, diagnostic, prescription } = data;

    // Vérifier si le médecin existe
    const medecin = await this.prisma.medecin.findUnique({
      where: { id: medecinId },
    });
    if (!medecin) throw new NotFoundException("Médecin non trouvé");

    // Vérifier si le patient existe
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException("Patient non trouvé");

    // Créer la consultation
    return this.prisma.consultation.create({
      data: {
        medecinId,
        patientId,
        diagnostic,
        prescription, // ✅ correspond à ton modèle Prisma
      },
    });
  }

  // 🔹 Lister toutes les consultations d'un médecin
  async getConsultations(medecinId: number) {
    return this.prisma.consultation.findMany({
      where: { medecinId },
      include: {
        patient: { include: { user: true } },
      },
    });
  }

  // 🔹 Générer une ordonnance PDF
  async generateOrdonnancePDF(consultationId: number) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        patient: { include: { user: true } },
        medecin: { include: { user: true } },
      },
    });

    if (!consultation)
      throw new NotFoundException('Consultation non trouvée');

    // Dossier de sortie
    const dir = 'ordonnances';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const filePath = `${dir}/ordonnance_${consultationId}.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('🩺 Ordonnance Médicale', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`👤 Patient : ${consultation.patient.user.name}`);
    doc.text(`👨‍⚕️ Médecin : ${consultation.medecin.user.name}`);
    doc.text(`📅 Date : ${consultation.date.toDateString()}`);
    doc.moveDown();

    doc.text(`Diagnostic : ${consultation.diagnostic}`);
    doc.text(`Prescription : ${consultation.prescription ?? 'Aucune'}`);

    doc.end();

    return { message: 'Ordonnance générée', filePath };
  }
}
