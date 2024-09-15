import { IsBoolean, IsString } from "class-validator";

export class CreateUserByPanelDto {

    @IsString()
    login: string;

    @IsString()
    password: string;

    @IsString()
    email?: string;

    @IsBoolean()
    canCreate: boolean;
    
    @IsBoolean()
    canUpdate: boolean;
    
    @IsBoolean()
    canDelete: boolean;
    
    @IsBoolean()
    canManage: boolean;

}