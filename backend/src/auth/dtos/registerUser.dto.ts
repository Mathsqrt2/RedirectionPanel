import { IsString } from "class-validator";

export class RegisterUserDto {

    @IsString()
    login: string;

    @IsString()
    password: string;

    @IsString()
    confirmPassword: string

}