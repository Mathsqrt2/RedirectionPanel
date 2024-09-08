import { IsString } from "class-validator";

export class RemoveEmailDto {

    @IsString()
    password: string;

}