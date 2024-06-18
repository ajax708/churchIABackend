import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Evento, EventoDocument } from './schema/evento-schema';
import { Model } from 'mongoose';

import * as path from 'path';
import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';


import Jimp from 'jimp';

@Injectable()
export class EventoService {
  private readonly graphqlUrl =  `${process.env.BACKEND_URL}/graphql`;
  constructor(
    @InjectModel(Evento.name) private eventoModel: Model<EventoDocument>,
  ){}

  create(createEventoDto: CreateEventoDto) {
    const createdItem = new this.eventoModel(createEventoDto);
    return createdItem.save();
  }

  findAll() {
    //traer todos los eventos que tienen la columna imagenes distintas de null
    return this.eventoModel.find({images: { $ne: null }}).exec();
  }

  async findById(id: string) {
    // Busca el evento por ID
    const evento = await this.eventoModel.findOne({ id:id }).exec();
    
    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    // Obtén la ruta de la carpeta base de imágenes
    const baseImagePath = path.join(__dirname, '..', '..');
    
    // Convierte las rutas de imágenes a base64
    const imagesBase64 = await Promise.all(evento.images.map(async (imagePath) => {
      const fullPath = path.join(baseImagePath, imagePath);
      return new Promise<string>((resolve, reject) => {
        fs.readFile(fullPath, (err, data) => {
          if (err) {
            return reject(new Error(`Error al leer la imagen en ${fullPath}: ${err.message}`));
          }
          resolve(`data:image/jpeg;base64,${data.toString('base64')}`);
        });
      });
    }));
    
    // Reemplaza las rutas con las imágenes en base64
    return {
      ...evento.toObject(), // Convierte el documento de Mongoose a un objeto plano
      images: imagesBase64
    };
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
    
          const mensajes = await this.generarTextoConGPT3( textoTranscrito);
          
          console.log("\nMensaje generado: " + mensajes);
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

  async generarImagenConTexto(mensaje: string): Promise<Buffer> {
    try {
      const prompt = `Create a spiritual or Christian-themed background image with the following message in the center: "${mensaje}"`;

      const response = await axios.post('https://api.openai.com/v1/images/generations', {
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.APIKEY_OPENIA}`,
          'Content-Type': 'application/json',
        },
      });

      const imageUrl = response.data.data[0].url;
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const image = await Jimp.read(imageResponse.data);

      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      image.print(font, 10, 10, {
        text: mensaje,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      }, image.getWidth() - 20, image.getHeight() - 20);

      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
      return buffer;
    } catch (error) {
      console.error("Error al generar imagen", error);
      throw new BadRequestException('Failed to generate image');
    }
  }

  async procesarAudioYGenerarImagenes(file: Express.Multer.File): Promise<Buffer[]> {
    try {
      const texto = await this.convertirAudioToText(file);
      const mensajes = await this.generarTextoConGPT3(texto);

      const imagenes = await Promise.all(mensajes.map(async (mensaje) => {
        const buffer = await this.generarImagenConTexto(mensaje);
        return buffer;
      }));

      return imagenes;
    } catch (error) {
      console.error("Error al procesar audio y generar imágenes", error);
      throw new BadRequestException('Failed to process audio and generate images');
    }
  }

  async generarImagenConTexto2(mensaje: string): Promise<string> {
    try {
      const prompt = `Create a spiritual or Christian-themed background image`;

      const response = await axios.post('https://api.openai.com/v1/images/generations', {
        prompt,
        n: 1,
        size: '1024x1024',
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.APIKEY_OPENIA}`,
          'Content-Type': 'application/json',
        },
      });

      const imageUrl = response.data.data[0].url;

      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const image = await Jimp.read(imageResponse.data);

      const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
      image.print(font, 10, 10, {
        text: mensaje,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      }, image.getWidth() - 25, image.getHeight() - 25);

      // Directorio base de almacenamiento
      const baseStorageDir = path.resolve(__dirname, '..', '..', 'storage', 'generated');
      if (!fs.existsSync(baseStorageDir)) {
        fs.mkdirSync(baseStorageDir, { recursive: true });
      }

      // Generar la ruta relativa
      const fileName = `${Date.now()}-image.jpg`;
      const outputPath = path.resolve(baseStorageDir, fileName);

      // Guardar la imagen
      await image.writeAsync(outputPath);

      // Retornar la ruta relativa
      const relativePath = path.join('storage', 'generated', fileName);
      return relativePath;
    } catch (error) {
      console.error("Error al generar imagen", error);
      throw new BadRequestException('Failed to generate image');
    }
  }

  async getEventos( _token: string): Promise<any> {
    const query = `
      {
        findAllEventos {
          id
          nombre
          fecha
          lugar
        }
      }
    `;
    const token = _token;
    const response: AxiosResponse<any> = await axios.post(
       this.graphqlUrl,
      {
        query,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data);
    return response.data;
  }
}


