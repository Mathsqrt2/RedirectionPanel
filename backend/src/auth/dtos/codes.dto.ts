import { IsDefined, IsNumber, IsString } from "class-validator";

export class CodesDto {

    @IsDefined()
    @IsNumber()
    id: number;
    
    @IsDefined()
    @IsString()
    email: string;

}