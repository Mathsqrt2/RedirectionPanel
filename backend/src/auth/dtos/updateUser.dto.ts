import { IsDefined, IsOptional, IsString } from "class-validator";

export class UpdateWholeUserDto {

    @IsDefined()
    @IsString()
    adminToken: string;

    @IsOptional()
    @IsString()
    newLogin?: string;

    @IsOptional()
    @IsString()
    newPassword?: string;

    @IsOptional()
    @IsString()
    newEmail?: string;

}