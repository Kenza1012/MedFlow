// backend/src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ✅ Créer un médecin
  async createMedecin(data: {
    name: string;
    email: string;
    password: string;
    specialite: string;
  }) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'MEDECIN',
        medecin: {
          create: {
            specialite: data.specialite,
          },
        },
      },
      include: {
        medecin: true,
      },
    });
  }

  // ✅ Créer un réceptionniste
  async createReceptionniste(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'RECEPTIONNISTE',
        receptionniste: {
          create: {},
        },
      },
      include: {
        receptionniste: true,
      },
    });
  }

  // ✅ Récupérer tout le personnel
  async getAllStaff() {
    const medecins = await this.prisma.medecin.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });

    const receptionnistes = await this.prisma.receptionniste.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });

    return {
      medecins: medecins.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        specialite: m.specialite,
        createdAt: m.user.createdAt,
        type: 'MEDECIN',
      })),
      receptionnistes: receptionnistes.map((r) => ({
        id: r.id,
        userId: r.userId,
        name: r.user.name,
        email: r.user.email,
        createdAt: r.user.createdAt,
        type: 'RECEPTIONNISTE',
      })),
    };
  }

  // ✅ Liste des médecins uniquement
  async getMedecins() {
    return this.prisma.medecin.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
        _count: {
          select: {
            consultations: true,
            rendezVous: true,
          },
        },
      },
    });
  }

  // ✅ Liste des réceptionnistes uniquement
  async getReceptionnistes() {
    return this.prisma.receptionniste.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });
  }

  // ✅ Supprimer un membre du personnel
  async deleteStaff(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { medecin: true, receptionniste: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role === 'PATIENT') {
      throw new Error('Impossible de supprimer un patient via cette route');
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // ✅ Dashboard statistiques
  async getDashboardStats(period: 'day' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    // Comptage du personnel
    const totalMedecins = await this.prisma.medecin.count();
    const totalReceptionnistes = await this.prisma.receptionniste.count();
    const totalPatients = await this.prisma.patient.count();

    // Factures
    const factures = await this.prisma.facture.findMany({
      where: {
        date: { gte: startDate },
      },
    });

    const totalFactures = factures.length;
    const facturesPayees = factures.filter((f) => f.statut === 'Payé').length;
    const facturesImpayees = factures.filter(
      (f) => f.statut === 'Non payé',
    ).length;
    const chiffreAffaires = factures
      .filter((f) => f.statut === 'Payé')
      .reduce((sum, f) => sum + f.montant, 0);

    // Rendez-vous
    const totalRendezVous = await this.prisma.rendezVous.count({
      where: {
        date: { gte: startDate },
      },
    });

    const rendezVousAujourdhui = await this.prisma.rendezVous.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    // Consultations
    const totalConsultations = await this.prisma.consultation.count({
      where: {
        date: { gte: startDate },
      },
    });

    return {
      period,
      staff: {
        medecins: totalMedecins,
        receptionnistes: totalReceptionnistes,
        patients: totalPatients,
        total: totalMedecins + totalReceptionnistes + totalPatients,
      },
      finance: {
        totalFactures,
        facturesPayees,
        facturesImpayees,
        chiffreAffaires: Number(chiffreAffaires.toFixed(2)),
        tauxPaiement:
          totalFactures > 0
            ? Number(((facturesPayees / totalFactures) * 100).toFixed(2))
            : 0,
      },
      activite: {
        totalRendezVous,
        rendezVousAujourdhui,
        totalConsultations,
        moyenneConsultationsParJour:
          period === 'day'
            ? totalConsultations
            : Number((totalConsultations / 30).toFixed(2)),
      },
    };
  }

  // ✅ Mettre à jour un service/tarif (stocké dans une table fictive ou configuration)
  async updateService(data: {
    serviceName: string;
    price: number;
    description?: string;
  }) {
    // Cette fonctionnalité nécessiterait une table Service dans votre schéma
    // Pour l'instant, on peut retourner les données simulées
    return {
      success: true,
      message: 'Service mis à jour',
      service: data,
    };
  }

  // ✅ Liste de tous les patients
  async getAllPatients() {
    return this.prisma.patient.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
        _count: {
          select: {
            consultations: true,
            rendezVous: true,
            factures: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  // ✅ Statistiques de revenus par mois
  async getRevenueStats(year?: number) {
    const targetYear = year || new Date().getFullYear();
    
    const factures = await this.prisma.facture.findMany({
      where: {
        statut: 'Payé',
        date: {
          gte: new Date(`${targetYear}-01-01`),
          lt: new Date(`${targetYear + 1}-01-01`),
        },
      },
    });

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthFactures = factures.filter(
        (f) => new Date(f.date).getMonth() === i,
      );
      return {
        month: new Date(targetYear, i, 1).toLocaleDateString('fr-FR', {
          month: 'short',
        }),
        revenue: monthFactures.reduce((sum, f) => sum + f.montant, 0),
        count: monthFactures.length,
      };
    });

    return {
      year: targetYear,
      monthlyRevenue,
      totalRevenue: factures.reduce((sum, f) => sum + f.montant, 0),
      totalFactures: factures.length,
    };
  }





async createAdmin(data: { name: string; email: string; password: string }) {
  if (!data) {
    throw new Error("Aucune donnée reçue");
  }

  if (!data.email) {
    throw new Error("Email manquant dans le body");
  }

  const existingUser = await this.prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await this.prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const { password, ...cleanUser } = user;
  return cleanUser;
}
}