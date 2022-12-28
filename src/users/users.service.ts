import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    const res = await this.userModel.find().exec();
    return res;
  }

  async findOne(_id: string): Promise<User> {
    const res = await this.userModel.findById(_id);
    return res;
  }

  async addUser(value: User): Promise<User> {
    const newValue = new this.userModel({
      name: value.name,
      username: value.username,
      mail: value.mail,
    });
    const result = await newValue.save();
    return result;
  }
  
  async updateUser(id: string, user: User): Promise<User> {
    const result = await this.userModel.findByIdAndUpdate(id, user, { 
      new: true, 
    });
    return result;
  }
}
