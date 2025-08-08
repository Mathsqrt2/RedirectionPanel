import { IsDefined, IsString } from "class-validator";
import { LoginUserDto } from "./loginUser.dto";

export class RegisterUserDto extends LoginUserDto {

    @IsDefined()
    @IsString()
    confirmPassword: string

}