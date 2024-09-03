import { IsNumber, IsString } from "class-validator";

export class CodesDto {

    @IsNumber()
    userId: number;
    
    @IsString()
    email: string;

}