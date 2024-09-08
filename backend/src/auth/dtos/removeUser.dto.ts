import { IsNumber, IsString } from "class-validator";

export class RemoveUserDto {

    @IsNumber()
    userId: number;

    @IsString()
    password: string;
    
}