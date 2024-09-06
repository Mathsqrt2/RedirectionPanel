import { IsNumber, IsString } from "class-validator";

export class UpdatePswdDTO {
    
    @IsString()
    password: string;

    @IsString()
    newPassword: string;

    @IsString()
    confirmPassword: string;

    @IsNumber()
    userId: number;
}