import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Evento, EventoDocument } from './schema/evento-schema';
import { Model } from 'mongoose';

import { extname } from 'path';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { response } from 'express';


@Injectable()
export class EventoService {

  constructor(
    @InjectModel(Evento.name) private eventoModel: Model<EventoDocument>,
  ){}

  create(createEventoDto: CreateEventoDto) {
    const createdItem = new this.eventoModel(createEventoDto);
    return createdItem.save();
  }

  findAll() {
    //traer todos los eventos menos la columna images
    return this.eventoModel.find().select('-images').exec();
    
  }

  findAllWithImages() {
    return this.eventoModel.find().exec();
  }

  findOne(id: number) {
    return this.eventoModel.findById(id).exec();
  }

  update(id: number, updateEventoDto: UpdateEventoDto) {
    return `This action updates a #${id} evento`;
  }

  remove(id: number) {
    return `This action removes a #${id} evento`;
  }

  async convertirAudioToMessage(file: Express.Multer.File) 
  {
      var mensajes = "";
      var textoTranscrito = "";

      try
      {
          // Convertir el audio a texto
          const textoTranscrito = await this.convertirAudioToText(file);
          

          console.log("Texto transcrito: " + textoTranscrito);

          
          const mensajes = await this.generarTextoConGPT3( textoTranscrito);
          
          console.log("Mensaje generado: " + mensajes);
          return mensajes; 
      }
      catch (error)
      {
          console.error("Error al convertir audio a mensaje", error);
          throw new BadRequestException('Failed to convert audio to message');
      }
  }

  async convertirAudioToText(file: Express.Multer.File) {
    try{
      console.log("Entro al metodo subir archivo")
      const filePath = `./uploads/${file.filename}`;
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('model', 'whisper-1'); 
      
      console.log("Enviar el archivo a la API de OpenAI")
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer `+process.env.APIKEY_OPENIA, 
        },
      });
      console.log("Respuesta de la API de OpenAI")
      console.log(response.data)
      // Eliminar el archivo del servidor después de enviarlo (opcional)
      fs.unlinkSync(filePath);
      return response.data.text;
    }catch(error){
      console.error("Error al convertir audio a texto", error);
      throw new BadRequestException('Failed to convert audio to text');
    }
  }

  async generarTextoConGPT3(audioText: string): Promise<string[]> {
    try {
      const prompt = `A continuación se te presenta una prédica: "${audioText}". Por favor, genera 3 frases o mensajes cortos que resuman la esencia de esta prédica.`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un asistente experto en generar mensajes cortos y concisos a partir de textos más largos.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.APIKEY_OPENIA}`,
          'Content-Type': 'application/json',
        },
      });

      const messages = response.data.choices[0].message.content.split('\n').filter(msg => msg.trim() !== '');
      return messages;
    } catch (error) {
      console.error("Error al consumir GPT-3.5", error);
      throw new BadRequestException('Failed to generate text with GPT-3.5');
    }
  }
}


