import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData = require('form-data'); // Importación correcta

@Injectable()
export class OpenAIService {
  private apiKey = process.env.OPENAI_API_KEY;

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

  async generarImagenConTexto(mensaje: string, index: number): Promise<string> {
    try {
      const prompt = `Genera una imagen con un paisaje espiritual o cristiano y sobrepone el siguiente mensaje: "${mensaje}"`;

      const response = await axios.post('https://api.openai.com/v1/images/generations', {
        prompt,
        n: 1,
        size: '1024x1024',
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const imageUrl = response.data.data[0].url;
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      const generatedDir = path.resolve('generated');
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir);
      }

      const imageName = `image${index + 1}.jpg`;
      const imagePath = path.join(generatedDir, imageName);
      fs.writeFileSync(imagePath, imageResponse.data);

      return imagePath;
    } catch (error) {
      console.error('Error al generar imagen con texto', error);
      throw new BadRequestException('Failed to generate image with text');
    }
  }

  async procesarAudioYGenerarImagenes(file: Express.Multer.File): Promise<string[]> {
    try {
      const audioText = await this.convertirAudioToText(file);

      // Generar texto con GPT-3.5 (3 mensajes)
      const gptResponse = await this.generarTextoConGPT3(audioText);
      const mensajes = gptResponse.choices[0].message.content.trim().split('\n');

      const imagePaths = [];
      for (const [index, mensaje] of mensajes.entries()) {
        const imagePath = await this.generarImagenConTexto(mensaje, index);
        imagePaths.push(imagePath);
      }

      return imagePaths;
    } catch (error) {
      console.error('Error al procesar audio y generar imágenes', error);
      throw new BadRequestException('Failed to process audio and generate images');
    }
  }

  async generarTextoConGPT3(audioText: string): Promise<any> {
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
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error al consumir GPT-3.5', error);
      throw new BadRequestException('Failed to generate text with GPT-3.5');
    }
  }
}
