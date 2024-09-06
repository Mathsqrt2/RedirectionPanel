import { IsBoolean, IsNumber } from "class-validator";

export class UpdatePermissionsDTO {
    
    @IsBoolean()
    canDelete: boolean;

    @IsBoolean()
    canUpdate: boolean;

    @IsBoolean()
    canCreate: boolean;

    @IsBoolean()
    canManage: boolean;

    @IsNumber()
    userId: number;
}