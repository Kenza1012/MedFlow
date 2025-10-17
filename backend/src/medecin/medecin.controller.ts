import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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

  @Get('rendezvous/:id')
  async getRendezVous(@Param('id') medecinId: number) {
    return this.medecinService.getRendezVous(Number(medecinId));
  }

  @Post('consultations')
  async addConsultation(
    @Body()
    body: {
      medecinId: number;
      patientId: number;
      diagnostic: string;
      prescription: string;
    },
  ) {
    return this.medecinService.addConsultation(body);
  }

  @Get('consultations/:id')
  async getConsultations(@Param('id') medecinId: number) {
    return this.medecinService.getConsultations(Number(medecinId));
  }

  @Get('ordonnance/:id/pdf')
  async generateOrdonnancePDF(@Param('id') consultationId: number) {
    return this.medecinService.generateOrdonnancePDF(Number(consultationId));
  }
}
