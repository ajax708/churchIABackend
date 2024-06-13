import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SermonService } from './sermon.service';
import { CreateSermonDto } from './dto/create-sermon.dto';
import { UpdateSermonDto } from './dto/update-sermon.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sermon')
@Controller('sermon')
export class SermonController {
  constructor(private readonly sermonService: SermonService) {}

  @Post()
  create(@Body() createSermonDto: CreateSermonDto) {
    return this.sermonService.create(createSermonDto);
  }

  @Get()
  findAll() {
    return this.sermonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sermonService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSermonDto: UpdateSermonDto) {
    return this.sermonService.update(+id, updateSermonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sermonService.remove(+id);
  }
}
