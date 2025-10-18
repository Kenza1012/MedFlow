import { Test, TestingModule } from '@nestjs/testing';
import { ReceptionnisteService } from './receptionniste.service';

describe('ReceptionnisteService', () => {
  let service: ReceptionnisteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceptionnisteService],
    }).compile();

    service = module.get<ReceptionnisteService>(ReceptionnisteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
