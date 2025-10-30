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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(Number(id));
  }

  // 🔹 NOUVEAU : Récupérer le patient par userId
  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.patientService.findByUserId(Number(userId));
  }

  // 🔹 NOUVEAU : Récupérer les rendez-vous d'un patient
  @Get(':id/rendezvous')
  findRendezVous(@Param('id') id: string) {
    return this.patientService.findRendezVous(Number(id));
  }

  // 🔹 NOUVEAU : Récupérer les factures d'un patient
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