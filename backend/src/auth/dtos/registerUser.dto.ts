import { LoginUserDto } from "./loginUser.dto";
import { IsString } from "class-validator";

export class RegisterUserDto extends LoginUserDto {

    @IsString()
    confirmPassword: string

}