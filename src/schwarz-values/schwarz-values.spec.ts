import { Test, TestingModule } from '@nestjs/testing';
import { SchwarzValuesService } from './schwarz-values.service';

describe('SchwarzValuesService', () => {
  let service: SchwarzValuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchwarzValuesService],
    }).compile();

    service = module.get<SchwarzValuesService>(SchwarzValuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
