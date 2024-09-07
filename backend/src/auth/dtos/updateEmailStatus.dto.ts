import { IsBoolean } from "class-validator";

export class UpdateStatusDTO {

    @IsBoolean()
    emailSent: boolean;

}