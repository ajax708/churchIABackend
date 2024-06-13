import { Injectable } from '@nestjs/common';
import { CreateSermonDto } from './dto/create-sermon.dto';
import { UpdateSermonDto } from './dto/update-sermon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sermon, SermonDocument } from './schema/sermon.schema';
import { Model } from 'mongoose';

@Injectable()
export class SermonService {
  constructor(
    @InjectModel(Sermon.name) private sermonModel: Model<SermonDocument>,
  ) {}

  async create(createSermonDto: CreateSermonDto) {
    const createdItem = new this.sermonModel(createSermonDto);
    return createdItem.save();
  }

  findAll() {
    return `This action returns all sermon`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sermon`;
  }

  update(id: number, updateSermonDto: UpdateSermonDto) {
    return `This action updates a #${id} sermon`;
  }

  remove(id: number) {
    return `This action removes a #${id} sermon`;
  }
}
