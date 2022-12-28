import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchwarzValuesSchema } from './schwarz-values.schema';
import { SchwarzValuesController } from './schwarz-values.controller';
import { SchwarzValuesService } from './schwarz-values.service';
import { RMQProducerService } from 'src/core/shared/services/rmq/producer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'values',
        schema: SchwarzValuesSchema,
        collection: 'values',
      },
    ]),
  ],
  controllers: [SchwarzValuesController],
  providers: [SchwarzValuesService, RMQProducerService],
})
export class SchwarzValuesModule {}
