import { IsDefined, IsString } from "class-validator";

export class LoginUserDto {

    @IsDefined()
    @IsString()
    login: string;

    @IsDefined()
    @IsString()
    password: string;

}