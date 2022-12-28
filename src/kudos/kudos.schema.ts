import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { Document } from 'mongoose';
import { ENDPOINTS_TYPE } from 'src/core/shared/enums';
import { SchwarzValues } from 'src/schwarz-values/schwarz-values.schema';

export type KudosDocument = Kudos & Document;

@Schema({ collection: ENDPOINTS_TYPE.KUDOS })
@ApiTags(ENDPOINTS_TYPE.KUDOS)
export class Kudos {
  @Prop({ required: true })
  @IsEmail()
  @ApiProperty()
  giver: string;

  @Prop({ required: true })
  @IsEmail()
  @ApiProperty()
  receiver: string;

  @Prop({ required: true })
  @IsPositive()
  @ApiProperty()
  kudos: number;

  @Prop({ required: true })
  @IsNotEmpty({
    always: false,
    message: 'Message should not be empty',
  })
  @ApiProperty()
  @IsString()
  message: string;

  @Prop()
  @IsUrl()
  @ApiProperty()
  media: string;

  @Prop({ required: false })
  @IsBoolean()
  @ApiProperty()
  superKudos: boolean;
  
  @Prop({ required: false })
  @ApiProperty()
  core_values: SchwarzValues[];

  @Prop({ default: null, required: false })
  @ApiProperty()
  createdAt: Date | null;

  @Prop({ default: null, required: false })
  @ApiProperty()
  updatedAt: Date | null;
}

export const KudosSchema = SchemaFactory.createForClass(Kudos);
