import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type EventoDocument = Evento & Document;

@Schema()
export class Evento {
    @Prop({ type: String })
    @Prop()
    id: string;

    @Prop()
    nombre: string;

    @Prop()
    fecha: Date;

    @Prop()
    lugar: String;

    @Prop()
    images: string[];
}

export const EventoSchema = SchemaFactory.createForClass(Evento);