import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaiementService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-11-17.clover',
    });
  }

  // ============================================
  // 💳 Créer une session de paiement
  // ============================================
  async createCheckoutSession(factureId: number, userEmail: string) {
    // 1️⃣ Vérifier que la facture existe
    const facture = await this.prisma.facture.findUnique({
      where: { id: factureId },
      include: {
        patient: { include: { user: true } },
        consultation: true,
      },
    });

    if (!facture) {
      throw new BadRequestException('Facture non trouvée');
    }

    if (facture.statut === 'Payée') {
      throw new BadRequestException('Cette facture est déjà payée');
    }

    // 2️⃣ Créer la session de paiement
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: userEmail,
        metadata: {
          factureId: String(factureId),
          patientId: String(facture.patientId),
        },
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Consultation médicale - Facture #${factureId}`,
                description: facture.consultation?.diagnostic || 'Consultation générale',
              },
              unit_amount: Math.round(facture.montant * 100), // Montant en centimes
            },
            quantity: 1,
          },
        ],
        // URLs de redirection
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient/payment-cancel?facture_id=${factureId}`,
      });

      console.log('✅ Session créée:', session.id);
      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error('❌ Erreur création session:', error);
      throw new BadRequestException('Erreur création session paiement');
    }
  }

  // ============================================
  // ✅ Vérifier et valider un paiement
  // ============================================
  async verifyPayment(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        throw new BadRequestException('Le paiement n\'a pas été complété');
      }

      const factureId = Number(session.metadata?.factureId);
      const patientId = Number(session.metadata?.patientId);

      if (!factureId || !patientId) {
        throw new BadRequestException('Métadonnées de session invalides');
      }

      // ✅ Marquer la facture comme payée
      const facture = await this.prisma.facture.update({
        where: { id: factureId },
        data: { statut: 'Payée' },
        include: {
          patient: { include: { user: true } },
          consultation: true,
        },
      });

      console.log('💰 Paiement validé pour facture:', factureId);

      return {
        success: true,
        factureId,
        patientId,
        montant: facture.montant,
        facture,
      };
    } catch (error) {
      console.error('❌ Erreur vérification paiement:', error);
      throw new BadRequestException('Erreur vérification paiement');
    }
  }

  // ============================================
  // 📋 Gérer le webhook Stripe
  // ============================================
  async handleWebhook(payload: Buffer, signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET non configuré');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );
    } catch (err: any) {
      console.error('❌ Webhook Error:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // 📍 Traiter différents événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const factureId = Number(session.metadata?.factureId);

        if (!factureId) {
          console.warn('⚠️ Webhook: factureId manquant');
          break;
        }

        // Marquer comme payée
        await this.prisma.facture.update({
          where: { id: factureId },
          data: { statut: 'Payée' },
        });

        console.log('✅ Webhook: Paiement validé pour facture', factureId);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('🔄 Remboursement reçu:', charge.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Paiement échoué:', paymentIntent.id);
        break;
      }

      default:
        console.log(`⚠️ Événement non traité: ${event.type}`);
    }

    return { received: true };
  }

  // ============================================
  // 💳 Récupérer les détails d'une session
  // ============================================
  async getSessionDetails(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return {
        id: session.id,
        status: session.payment_status,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        customerEmail: session.customer_email,
        metadata: session.metadata,
      };
    } catch (error) {
      throw new BadRequestException('Session non trouvée');
    }
  }

  // ============================================
  // 📊 Récupérer l'historique des factures payées
  // ============================================
  async getPatientPaymentHistory(patientId: number) {
    return this.prisma.facture.findMany({
      where: {
        patientId,
        statut: 'Payée',
      },
      include: {
        consultation: {
          include: {
            medecin: { include: { user: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // ============================================
  // 📊 Récupérer les factures impayées
  // ============================================
  async getPatientUnpaidInvoices(patientId: number) {
    return this.prisma.facture.findMany({
      where: {
        patientId,
        statut: 'Non payée',
      },
      include: {
        consultation: {
          include: {
            medecin: { include: { user: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}

