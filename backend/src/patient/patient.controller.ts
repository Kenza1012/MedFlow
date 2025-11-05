// patient.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  create(@Body() body: { userId: number; dateNaissance: Date; antecedents?: string }) {
    return this.patientService.create(body);
  }

  @Get()
  findAll() {
    return this.patientService.findAll();
  }

  // ✅ 1️⃣ Cette route doit venir AVANT la route générique ":id"
  @Get('user/:userId')
async getPatientByUserId(@Param('userId') userId: string) {
  return this.patientService.findByUserId(Number(userId));
}

  // ✅ 2️⃣ Route classique : patient par ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(Number(id));
  }

  @Get(':id/rendezvous')
  findRendezVous(@Param('id') id: string) {
    return this.patientService.findRendezVous(Number(id));
  }

  @Get(':id/factures')
  findFactures(@Param('id') id: string) {
    return this.patientService.findFactures(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.patientService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(Number(id));
  }
}
