import { IsString, IsBoolean } from 'class-validator';

export class UsersDto {

    @IsString()
    public login: string;

    @IsString()
    public password: string;

    @IsBoolean()
    public canDelete: boolean;

    @IsBoolean()
    public canUpdate: boolean;

    @IsBoolean()
    public canCreate: boolean;

    @IsBoolean()
    public canManage: boolean;

}