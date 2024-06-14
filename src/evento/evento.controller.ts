import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res, HttpException, HttpStatus } from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer, diskStorage } from 'multer';


import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('evento')
@Controller('evento')
export class EventoController {
  constructor(private readonly eventoService: EventoService,
    private readonly authService: AuthService, 
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

  @Post('eventByid')
async findOne(@Body() id: string) {
  console.log(id);
  try {
    const event = await this.eventoService.findById(id);
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    return event;
  } catch (error) {
    console.error(error);
    throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File, 
    @Body() createEventoDto: CreateEventoDto,
    @Res() res: Response
  ) 
  {
    console.log(createEventoDto);
     if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!createEventoDto.images) {
      createEventoDto.images = [];
    }

    
    const response= await this.eventoService.convertirAudioToMessage(file);
    for (let i = 0; i < response.length; i++) {
      console.log("Mensaje generado: " + response[i]);
      const imageGenerated = await this.eventoService.generarImagenConTexto2(response[i]);

      createEventoDto.images.push(imageGenerated);
    
    }

    await this.eventoService.create(createEventoDto);
    
    console.log("Imagenes generadas: " + createEventoDto.images);
    return res.json(response);  
    
  }



  @Post('graphqlevents')
  async findAllEvents(): Promise<any> {
    const isAuthenticate: boolean= await this.authService.isAuthenticatedUser();
    if(isAuthenticate){
      const token = this.authService.getAccessToken();
      return await this.eventoService.getEventos(token);
    }else{
      throw new HttpException('Jwt is not valid', HttpStatus.UNAUTHORIZED);
    }
  }

}
