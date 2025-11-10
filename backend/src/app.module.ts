import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from './prisma.module';
import { PatientModule } from './patient/patient.module';
import { MedecinModule } from './medecin/medecin.module';
import { RendezvousModule } from './rendezvous/rendezvous.module';
import { ReceptionnisteModule } from './receptionniste/receptionniste.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    PatientModule,
    MedecinModule,
    RendezvousModule,
    ReceptionnisteModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthService],
})
export class AppModule {}
