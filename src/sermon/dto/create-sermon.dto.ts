import { IsNotEmpty } from "class-validator";

export class CreateSermonDto {
    @IsNotEmpty()
    name: string;
    
    @IsNotEmpty()
    preacher: string;
    date: Date;

    @IsNotEmpty()
    audio: string;
}
