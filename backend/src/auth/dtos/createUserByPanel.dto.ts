import { IsBoolean, IsDefined, IsOptional, IsString } from "class-validator";

export class CreateUserByPanelDto {

    @IsDefined()
    @IsString()
    login: string;
    
    @IsDefined()
    @IsString()
    password: string;
    
    @IsString()
    @IsOptional()
    email?: string;
    
    @IsDefined()
    @IsBoolean()
    canCreate: boolean;
    
    @IsDefined()
    @IsBoolean()
    canUpdate: boolean;
    
    @IsDefined()
    @IsBoolean()
    canDelete: boolean;
    
    @IsDefined()
    @IsBoolean()
    canManage: boolean;

}