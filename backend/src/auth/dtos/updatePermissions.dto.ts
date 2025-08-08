import { IsBoolean, IsDefined, IsNumber } from "class-validator";

export class UpdatePermissionsDto {
    
    @IsDefined()
    @IsBoolean()
    canDelete: boolean;
    
    @IsDefined()
    @IsBoolean()
    canUpdate: boolean;
    
    @IsDefined()
    @IsBoolean()
    canCreate: boolean;
    
    @IsDefined()
    @IsBoolean()
    canManage: boolean;
    
    @IsDefined()
    @IsNumber()
    userId: number;
}