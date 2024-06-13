import { IsNotEmpty } from "class-validator";

export class CreateEventoDto {
    @IsNotEmpty()
    title: string;
    description: string;
    fecha: Date;
    images: string[];
}
