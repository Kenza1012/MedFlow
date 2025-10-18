import { Test, TestingModule } from '@nestjs/testing';
import { ReceptionnisteController } from './receptionniste.controller';

describe('ReceptionnisteController', () => {
  let controller: ReceptionnisteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceptionnisteController],
    }).compile();

    controller = module.get<ReceptionnisteController>(ReceptionnisteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
