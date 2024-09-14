import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateStatusDto {

    @IsBoolean()
    emailSent: boolean;

    @IsString()
    @IsOptional()
    newEmail?: string;

}