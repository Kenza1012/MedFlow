// src/medecin/medecin.controller.ts
import { Controller, Get, Post, Body, Req, Param, UseGuards, NotFoundException, Res } from '@nestjs/common';
import { Response } from 'express'; // ✅ Ajouter cet import
import { MedecinService } from './medecin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MEDECIN)
@Controller('medecin')
export class MedecinController {
  constructor(private readonly medecinService: MedecinService) {}

   //  Nouvelle route pour récupérer tous les médecins disponibles
 // ✅ Route publique (pour tous les utilisateurs connectés)
  @Get()
  @Roles(Role.PATIENT, Role.ADMIN, Role.MEDECIN, Role.RECEPTIONNISTE)
 
  async getMedecinsDisponibles() {
    return this.medecinService.getAllMedecinsDisponibles();
  }

  @Get('rendezvous')
  async getRendezVous(@Req() req) {
    const medecin = await this.medecinService.findByUserId(req.user.userId);
    if (!medecin) throw new NotFoundException('Médecin non trouvé');
    return this.medecinService.getRendezVous(medecin.id);
  }

  @Get('consultations')
  async getConsultations(@Req() req) {
    const medecin = await this.medecinService.findByUserId(req.user.userId);
    if (!medecin) throw new NotFoundException('Médecin non trouvé');
    return this.medecinService.getConsultations(medecin.id);
  }

  @Post('consultations')
  async addConsultation(
    @Req() req,
    @Body() data: { patientId: number; diagnostic: string; prescription?: string }
  ) {
    const medecin = await this.medecinService.findByUserId(req.user.userId);
    if (!medecin) throw new NotFoundException('Médecin non trouvé');
    return this.medecinService.addConsultation(medecin.id, data);
  }

  // ✅ Correction pour PDF
   @Get('ordonnance/:id/pdf')
  async generateOrdonnancePDF(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const consultationId = Number(id);
    if (isNaN(consultationId)) {
      return res.status(400).send('ID invalide');
    }

    try {
      const pdfBuffer = await this.medecinService.generateOrdonnancePDF(consultationId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ordonnance_${consultationId}.pdf`);
      res.send(pdfBuffer); // ✅ utiliser send() au lieu de end()
    } catch (err) {
      console.error(err);
      return res.status(500).send(err.message || 'Erreur lors de la génération du PDF');
    }
  }

}
