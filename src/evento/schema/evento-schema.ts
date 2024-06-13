import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type EventoDocument = Evento & Document;

@Schema()
export class Evento {
    @Prop()
    title: string;

    @Prop()
    description: string;

    @Prop()
    fecha: Date;

    @Prop()
    images: string[];
}

export const EventoSchema = SchemaFactory.createForClass(Evento);