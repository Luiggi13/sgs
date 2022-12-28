import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import AppController from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { KudosModule } from './kudos/kudos.module';
import { SchwarzValuesModule } from './schwarz-values/schwarz-values.module';

import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './config/configuration';
import { RMQConsumerService } from './core/shared/services/rmq/consumer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: true,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`,
    ),
    KudosModule,
    SchwarzValuesModule,
    UsersModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RMQConsumerService,
  ],
})
export class AppModule {}