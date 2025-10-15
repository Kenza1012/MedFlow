import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // rend ce module accessible partout
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // important
})
export class PrismaModule {}
