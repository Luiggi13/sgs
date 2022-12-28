import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './user.schema';
import { RMQProducerService } from 'src/core/shared/services/rmq/producer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema, collection: 'user' },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, RMQProducerService],
})
export class UsersModule {}
