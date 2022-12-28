import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Document } from 'mongoose';
import { ENDPOINTS_TYPE } from 'src/core/shared/enums';

export type UserDocument = User & Document;

@Schema({ collection: ENDPOINTS_TYPE.USER })
@ApiTags(ENDPOINTS_TYPE.USER)
export class User {
  @Prop({ required: true })
  @IsNotEmpty({
    always: false,
    message: 'Message should not be empty',
  })
  @ApiProperty()
  name: string;

  @Prop({ required: true })
  @IsNotEmpty({
    always: false,
    message: 'Message should not be empty',
  })
  @ApiProperty()
  username: string;

  @Prop({ required: true })
  @IsEmail()
  @ApiProperty()
  mail: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
