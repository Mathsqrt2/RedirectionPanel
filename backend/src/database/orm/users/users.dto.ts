import { IsString, IsBoolean } from 'class-validator';

export class UsersDto {

    @IsString()
    login: string;

    @IsString()
    password: string;

    @IsBoolean()
    canDelete: boolean;

    @IsBoolean()
    canUpdate: boolean;

    @IsBoolean()
    canCreate: boolean;
    
}