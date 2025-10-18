import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Patch 
} from '@nestjs/common';
import { ReceptionnisteService } from './receptionniste.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RECEPTIONNISTE)
@Controller('reception') // ⬅️ CHANGER ICI : 'reception' au lieu de 'receptionniste'
export class ReceptionnisteController {
  constructor(private readonly receptionnisteService: ReceptionnisteService) {}

  // 🔹 RENDEZ-VOUS
  @Post('rendezvous')
  async createRendezVous(
    @Body()
    body: {
      date: string;
      motif: string;
      patientId: number;
      medecinId: number;
    },
  ) {
    return this.receptionnisteService.createRendezVous({
      ...body,
      date: new Date(body.date),
    });
  }

  @Put('rendezvous/:id')
  async updateRendezVous(
    @Param('id') id: string,
    @Body() body: { date?: string; motif?: string; status?: string }
  ) {
    const data: any = { ...body };
    if (body.date) data.date = new Date(body.date);
    
    return this.receptionnisteService.updateRendezVous(Number(id), data);
  }

  @Delete('rendezvous/:id')
  async cancelRendezVous(@Param('id') id: string) {
    return this.receptionnisteService.cancelRendezVous(Number(id));
  }

  @Get('rendezvous')
  async getAllRendezVous() {
    return this.receptionnisteService.getAllRendezVous();
  }

  // 🔹 FACTURES
  @Post('facture')
  async createFacture(
    @Body()
    body: {
      montant: number;
      patientId: number;
      consultationId?: number;
    },
  ) {
    return this.receptionnisteService.createFacture(body);
  }

  @Get('factures')
  async getAllFactures() {
    return this.receptionnisteService.getAllFactures();
  }

  @Patch('facture/:id/payer')
  async markFactureAsPaid(@Param('id') id: string) {
    return this.receptionnisteService.markFactureAsPaid(Number(id));
  }

  @Get('factures/patient/:patientId')
  async getFacturesByPatient(@Param('patientId') patientId: string) {
    return this.receptionnisteService.getFacturesByPatient(Number(patientId));
  }

  // 🔹 GESTION DU PROFIL RÉCEPTIONNISTE
  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    return this.receptionnisteService.findOne(Number(id));
  }

  @Get('profile/user/:userId')
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.receptionnisteService.findByUserId(Number(userId));
  }
}