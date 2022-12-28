import { Test, TestingModule } from '@nestjs/testing';
import { SchwarzValuesController } from './schwarz-values.controller';
import { SchwarzValuesService } from './schwarz-values.service';

describe('SchwarzValuesController', () => {
  let controller: SchwarzValuesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchwarzValuesController],
      providers: [SchwarzValuesService],
    }).compile();

    controller = module.get<SchwarzValuesController>(SchwarzValuesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
