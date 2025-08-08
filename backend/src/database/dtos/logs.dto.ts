import { IsString, IsNumber, IsDefined } from 'class-validator';

export class LogsDto {

    @IsDefined()
    @IsString()
    public label: string;
    
    @IsDefined()
    @IsString()
    public description: string;
    
    @IsDefined()
    @IsString()
    public status: string;
    
    @IsDefined()
    @IsNumber()
    public duration: number;

}