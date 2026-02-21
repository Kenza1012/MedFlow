import { Test, TestingModule } from '@nestjs/testing';
import { MedecinController } from './medecin.controller';

describe('MedecinController', () => {
  let controller: MedecinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedecinController],
    }).compile();

    controller = module.get<MedecinController>(MedecinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
