import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateWholeUserDto {
    
    @IsString()
    adminToken: string;

    @IsString()
    @IsOptional()
    newLogin?: string | null;

    @IsString()
    @IsOptional()
    newPassword?: string | null;

    @IsString()
    @IsOptional()
    newEmail?: string | null;

}