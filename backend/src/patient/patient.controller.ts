import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PatientService } from './patient.service';

@Controller('patients')
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

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.patientService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(Number(id));
  }
}
