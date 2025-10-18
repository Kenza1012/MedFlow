import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { RendezVousService } from './rendezvous.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('rendezvous')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  // =====================
  // 📅 Créer un rendez-vous (Patient)
  // =====================
  @Roles(Role.PATIENT)
  @Post()
  async createRendezVous(
    @Body()
    body: {
      date: string;
      motif: string;
      patientId: number;
      medecinId: number;
    },
  ) {
    return this.rendezVousService.createRendezVous(body);
  }

  // =====================
  // 👨‍⚕️ Voir les rendez-vous d’un médecin
  // =====================
  @Roles(Role.MEDECIN)
  @Get('medecin/:id')
  async getRendezVousByMedecin(@Param('id') medecinId: number) {
    return this.rendezVousService.getRendezVousByMedecin(Number(medecinId));
  }

  // =====================
  // 🧾 Voir tous les rendez-vous (Réceptionniste)
  // =====================
  @Roles(Role.RECEPTIONNISTE)
  @Get('all')
  async getAllRendezVous() {
    return this.rendezVousService.getAllRendezVous();
  }
}
