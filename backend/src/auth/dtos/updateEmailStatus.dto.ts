import { IsBoolean, IsDefined, IsOptional, IsString } from "class-validator";

export class UpdateStatusDto {

    @IsDefined()
    @IsBoolean()
    emailSent: boolean;

    @IsString()
    @IsOptional()
    newEmail?: string;

}