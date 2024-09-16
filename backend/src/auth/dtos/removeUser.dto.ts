import { IsOptional, IsString } from "class-validator";

export class RemoveUserDto {

    @IsString()
    @IsOptional()
    login?: string;
    
    @IsString()
    @IsOptional()
    password?: string;

}