import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Document } from 'mongoose';
import { ENDPOINTS_TYPE } from 'src/core/shared/enums';

export type ValuesDocument = SchwarzValues & Document;

@Schema({ collection: ENDPOINTS_TYPE.VALUES })
@ApiTags(ENDPOINTS_TYPE.VALUES)
export class SchwarzValues {
  @Prop({ required: true })
  @ApiProperty()
  name: string;

  @Prop({ required: true })
  @ApiProperty()
  description: string;

  @Prop({ required: true })
  @ApiProperty()
  icon: string;
  
  @Prop({ required: true })
  @IsNotEmpty({
    always: false,
    message: 'Color should not be empty',
  })
  @ApiProperty()
  color: string;
}

export const SchwarzValuesSchema = SchemaFactory.createForClass(SchwarzValues);
