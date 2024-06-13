import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SermonDocument = Sermon & Document;

@Schema()
export class Sermon {
    @Prop()
    name: string;

    @Prop()
    preacher: string;

    @Prop()
    date: Date;

    @Prop()
    audio: string;
}

export const SermonSchema = SchemaFactory.createForClass(Sermon);