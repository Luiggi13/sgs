import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KudosService } from './kudos.service';
import { KudosController } from './kudos.controller';
import { KudosSchema } from './kudos.schema';
import { RMQProducerService } from 'src/core/shared/services/rmq/producer.service';
import { SchwarzValuesService } from 'src/schwarz-values/schwarz-values.service';
import { SchwarzValuesSchema } from 'src/schwarz-values/schwarz-values.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'kudos', schema: KudosSchema, collection: 'kudos' },
      { name: 'values', schema: SchwarzValuesSchema, collection: 'values'},
    ]),
  ],
  controllers: [KudosController],
  providers: [KudosService, SchwarzValuesService, RMQProducerService],
})
export class KudosModule {}
