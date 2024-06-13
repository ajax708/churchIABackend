import { Module } from '@nestjs/common';
import { EventoService } from './evento.service';
import { EventoController } from './evento.controller';
import { Evento, EventoSchema } from './schema/evento-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAIService } from './OpenIA.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Evento.name,
          schema: EventoSchema,
        },
      ],
    )
  ],
  controllers: [EventoController],
  providers: [EventoService, OpenAIService],
})
export class EventoModule {}
