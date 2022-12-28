import { Test, TestingModule } from '@nestjs/testing';
import { KudosController } from './kudos.controller';
import { KudosService } from './kudos.service';

describe('KudosController', () => {
  let controller: KudosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KudosController],
      providers: [KudosService],
    }).compile();

    controller = module.get<KudosController>(KudosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
