import { IsDefined, IsNumber, IsString } from "class-validator";

export class UpdatePasswordDto {
    
    @IsDefined()
    @IsString()
    password: string;
    
    @IsDefined()
    @IsString()
    newPassword: string;
    
    @IsDefined()
    @IsString()
    confirmPassword: string;
    
    @IsDefined()
    @IsNumber()
    userId: number;
}