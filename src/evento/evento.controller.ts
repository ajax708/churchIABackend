import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer, diskStorage } from 'multer';


import { Response } from 'express';

@ApiTags('evento')
@Controller('evento')
export class EventoController {
  constructor(private readonly eventoService: EventoService,
  ) {}

  @Post()
  create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventoService.create(createEventoDto);
  }

  @Get()
  findAll() {
    return this.eventoService.findAll();
  }

  @Get('eventWithImages')
  findAllWithImages() {
    return this.eventoService.findAllWithImages();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventoService.update(+id, updateEventoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventoService.remove(+id);
  }

  
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
          return cb(null, filename);
        },
      }),
      
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    
  
     if (!file) {
      throw new BadRequestException('File is required');
    }

    
    const response= await this.eventoService.convertirAudioToMessage(file);
    const imageGenerated = await this.eventoService.generarImagenConTexto2(response[0]);
    console.log("Imagen generada: " + imageGenerated);
    return res.json(response); 

  }

}
