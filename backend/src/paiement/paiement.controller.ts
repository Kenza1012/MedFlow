
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  BadRequestException,
  UseGuards,
  Res,
  RawBodyRequest,
} from '@nestjs/common';
import { Response } from 'express';
import { PaiementService } from './paiement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('paiement')
export class PaiementController {
  constructor(private paiementService: PaiementService) {}

  // ============================================
  // 📌 Créer une session de paiement
  // ============================================
  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async createCheckout(
    @Body() body: { factureId: number },
    @Req() req: any
  ) {
    if (!body.factureId) {
      throw new BadRequestException('factureId requis');
    }

    const user = req.user;
    console.log('📤 Créer session pour user:', user.email);

    const result = await this.paiementService.createCheckoutSession(
      body.factureId,
      user.email
    );

    return result;
  }
  
  // ============================================
  // ✅ Vérifier le paiement après succès
  // ============================================
  @Post('verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async verifyPayment(@Body() body: { sessionId: string }) {
    if (!body.sessionId) {
      throw new BadRequestException('sessionId requis');
    }

    console.log('✅ Vérifier paiement:', body.sessionId);
    const result = await this.paiementService.verifyPayment(body.sessionId);
    return result;
  }

  // ============================================
  // 🔔 Webhook Stripe (PUBLIC - pas d'authentification)
  // ============================================
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response
  ) {
    try {
      const payload = req.rawBody;

      if (!signature) {
        console.error('❌ Signature stripe manquante');
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      if (!payload) {
        console.error('❌ Payload manquant');
        return res.status(400).json({ error: 'Missing payload' });
      }

      console.log('🔔 Webhook reçu');
      const result = await this.paiementService.handleWebhook(payload, signature);

      return res.json(result);
    } catch (error: any) {
      console.error('❌ Webhook Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  // ============================================
  // 📋 Récupérer l'historique des paiements
  // ============================================
  @Get('history/:patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT, Role.ADMIN)
  async getPaymentHistory(@Param('patientId') patientId: string) {
    const id = Number(patientId);
    if (isNaN(id)) {
      throw new BadRequestException('patientId invalide');
    }

    console.log('📋 Historique paiements pour patient:', id);
    return this.paiementService.getPatientPaymentHistory(id);
  }

  // ============================================
  // 📋 Récupérer les factures impayées
  // ============================================
  @Get('unpaid/:patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT, Role.ADMIN)
  async getUnpaidInvoices(@Param('patientId') patientId: string) {
    const id = Number(patientId);
    if (isNaN(id)) {
      throw new BadRequestException('patientId invalide');
    }

    console.log('📋 Factures impayées pour patient:', id);
    return this.paiementService.getPatientUnpaidInvoices(id);
  }

  // ============================================
  // 📊 Récupérer les détails d'une session
  // ============================================
  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard)
  async getSessionDetails(@Param('sessionId') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('sessionId requis');
    }

    console.log('📊 Détails session:', sessionId);
    return this.paiementService.getSessionDetails(sessionId);
  }
}