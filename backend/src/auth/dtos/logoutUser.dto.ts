import { IsString } from "class-validator";

export class LogoutUserDto {

    @IsString()
    login: string;

    @IsString()
    accessToken: string

}