import { Module } from '@nestjs/common';
import { RendezVousService } from './rendezvous.service'; 
import { RendezVousController } from './rendezvous.controller';


@Module({
  providers: [RendezVousService],
  controllers: [RendezVousController]
})
export class RendezvousModule {}
