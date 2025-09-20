import { IsString, IsBoolean, IsDefined } from 'class-validator';

export class UsersDto {

    @IsDefined()
    @IsString()
    public login: string;
    
    @IsDefined()
    @IsString()
    public password: string;
    
    @IsDefined()
    @IsBoolean()
    public canDelete: boolean;
    
    @IsDefined()
    @IsBoolean()
    public canUpdate: boolean;
    
    @IsDefined()
    @IsBoolean()
    public canCreate: boolean;
    
    @IsDefined()
    @IsBoolean()
    public canManage: boolean;

}