import { IsString } from "class-validator";

export class RemoveUserDto {

    @IsString()
    login :string;

    @IsString()
    password: string;
    
}