import { IsNumber, IsString } from "class-validator";

export class CodesDto {

    @IsNumber()
    id: number;
    
    @IsString()
    email: string;

}