import { Model } from 'mongoose';
import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Kudos, KudosDocument } from './kudos.schema';
import { KudosNotFound } from 'src/exceptions';
import { FilterDate } from 'src/core/shared/interfaces';
import { SchwarzValues, ValuesDocument } from 'src/schwarz-values/schwarz-values.schema';

@Injectable()
export class KudosService {
  constructor(@InjectModel('kudos') private kudosModel: Model<KudosDocument>,
    @InjectModel('values') private valueModel: Model<ValuesDocument>
  ) { }

  async findAll(): Promise<Kudos[]> {
    return this.kudosModel.find().exec();
  }

  async findOne(_id: string): Promise<Kudos | KudosNotFound> {
    const result = this.kudosModel.findById(_id);
    const message = `Kudos with id ${_id} is invalid`;
    if (_id.match(/^[0-9a-fA-F]{24}$/)) return result;
    return new KudosNotFound(message, 404);
  }

  async findByGiver(giver: string): Promise<Kudos[]> {
    return this.kudosModel.find({ giver: giver });
  }

  async findByReceiver(receiver: string): Promise<Kudos[]> {
    return this.kudosModel.find({ receiver: receiver });
  }

  async filterKudos(filter: Kudos, sorting: string): Promise<Kudos[]> {
    const date = new Date();
    const dateFilter = sorting
      ? {
        createdAt: {
          $gte:
            (sorting === 'lastWeek' &&
              startOfDay(
                new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
              )) ||
            (sorting === 'lastMonth' &&
              startOfDay(date.setMonth(date.getMonth() - 1))) ||
            (sorting === 'lastYear' &&
              startOfDay(date.setFullYear(date.getFullYear() - 1))),
          $lte: endOfDay(new Date()),
        },
      }
      : null;

    return this.kudosModel.find({
      ...filter,
      ...dateFilter,
    });
  }

  async filterByDate(dateFilter: FilterDate): Promise<Kudos[]> {
    const dateFiltered = dateFilter
      ? {
        createdAt: {
          $gte: `${dateFilter.from}`,
          $lte: dateFilter.to ?? new Date(),
        },
      }
      : null;

    return this.kudosModel.find({
      ...dateFiltered,
    });
  }

  async create(createKudos: Kudos): Promise<Kudos> {
    const newKudos = new this.kudosModel({
      giver: createKudos.giver,
      receiver: createKudos.receiver,
      kudos: createKudos.kudos,
      message: createKudos.message,
      media: createKudos.media,
      superKudos: createKudos.superKudos || false,
      core_values: createKudos.core_values || [],
      createdAt: new Date(createKudos.createdAt) || Date.now(),
      updatedAt: null,
    });
    const result = await newKudos.save();
    return result;
  }

  async checkValuesExistInDatabase(core_values: SchwarzValues[]): Promise<string[]> {
    let founds: { exist: boolean, value: string }[] = [];
    let foundss: string[] = [];
    for (const value of core_values) {
      const result = await this.valueModel.findOne({ name: { $regex: value.name, $options: 'i' } });
      if (!result) foundss.push(value.name.toUpperCase())
    }
    return foundss;
  }
}
