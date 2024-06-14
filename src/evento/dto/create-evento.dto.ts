import { IsNotEmpty } from "class-validator";

export class CreateEventoDto {
    @IsNotEmpty()
    id: string;
    nombre: string;
    fecha: Date;
    lugar: string;
    images: string[]=[];
}
