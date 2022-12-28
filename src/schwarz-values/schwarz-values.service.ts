import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchwarzValues, ValuesDocument } from './schwarz-values.schema';
import { KudosNotFound } from 'src/exceptions';
import { ErrorDuplicateString, ErrorsDuplicateEntriesMessages, FindDuplicateString } from 'src/core/shared/interfaces/unique.interface';

export interface AllValues {
  count: number;
  values: any[];
}
export interface RabbitMQMessage {
  exchange_name: string;
  message: string;
  method: string;
  date: Date;
  payload: any;
  queue_name: string;
  routingKey: string;
  status_code: number;
}
@Injectable()
export class SchwarzValuesService {
  constructor(
    @InjectModel('values') private valueModel: Model<ValuesDocument>,
  ) {}

  async findAll(): Promise<SchwarzValues[]> {
    const res = await this.valueModel.find().exec();
    return res;
  }

  async findAllDropdown(): Promise<{ count: number; values: string[] }> {
    const res = (await this.valueModel.find().exec()).map((item) => item.name);
    const obj: AllValues = {
      count: res.length,
      values: res,
    };
    return obj;
  }

  async findOne(_id: string): Promise<SchwarzValues> {
    const res = await this.valueModel.findById(_id);
    return res;
  }

  async addValue(value: SchwarzValues): Promise<SchwarzValues> {
    const newValue = new this.valueModel({
      name: value.name,
      description: value.description,
      icon: value.icon,
      color: value.color
    });
    const result = await newValue.save();
    return result;
  }

  async deleteValue(id: string): Promise<SchwarzValues | KudosNotFound> {
    const message = `Value with id ${id} is invalid`;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return new KudosNotFound(message, 404);

    const result = await this.valueModel.findByIdAndDelete(id);
    if (!result)
      return new KudosNotFound(
        'No Values matched the query. Deleted 0 values.',
        404,
      );

    return result;
  }

  async isInDatabase(nameToFind: FindDuplicateString): Promise<SchwarzValues | null> {
    const name: string  = nameToFind.value;
    const existEntry = await this.valueModel.findOne({ name: { $regex: name, $options: 'i' } });
    return existEntry;
  }
}
