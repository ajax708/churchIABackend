import { Module } from '@nestjs/common';
import { EventoService } from './evento.service';
import { EventoController } from './evento.controller';
import { Evento, EventoSchema } from './schema/evento-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAIService } from './OpenIA.service';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Evento.name,
          schema: EventoSchema,
        },
      ],
    ),
    HttpModule,
    AuthModule,
  ],
  controllers: [EventoController],
  providers: [EventoService, OpenAIService],
})
export class EventoModule {}
