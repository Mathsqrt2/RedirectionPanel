import { IsDefined, IsString } from "class-validator";

export class RemoveEmailDto {

    @IsDefined()
    @IsString()
    password: string;

}