import { IsNumber, IsString } from "class-validator";

export class VerifyEmailDto {

    @IsNumber()
    userId: number;
    
    @IsString()
    email: string;

}