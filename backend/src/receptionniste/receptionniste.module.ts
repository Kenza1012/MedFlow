import { Module } from '@nestjs/common';
import { ReceptionnisteService } from './receptionniste.service';
import { ReceptionnisteController } from './receptionniste.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReceptionnisteController],
  providers: [ReceptionnisteService],
  exports: [ReceptionnisteService],
})
export class ReceptionnisteModule {}