import { Module } from '@nestjs/common';
import { MedecinService } from './medecin.service';
import { MedecinController } from './medecin.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [MedecinController],
  providers: [MedecinService, PrismaService],
})
export class MedecinModule {}
