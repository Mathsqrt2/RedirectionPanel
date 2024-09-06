import { IsBoolean, IsNumber } from "class-validator";

export class UpdateStatusDTO {

    @IsBoolean()
    emailSent: boolean;

}