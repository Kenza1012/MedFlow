import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaiementController } from './paiement.controller';
import { PaiementService } from './paiement.service';
import { PrismaModule } from '../prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    AuthModule, 
  ],
  controllers: [PaiementController],
  providers: [PaiementService],
  exports: [PaiementService], // Exporter le service pour d'autres modules
})
export class PaiementModule {}