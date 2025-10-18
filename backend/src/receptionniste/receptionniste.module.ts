import { Module } from '@nestjs/common';
import { ReceptionnisteController } from './receptionniste.controller';
import { ReceptionnisteService } from './receptionniste.service';

@Module({
  controllers: [ReceptionnisteController],
  providers: [ReceptionnisteService]
})
export class ReceptionnisteModule {}
