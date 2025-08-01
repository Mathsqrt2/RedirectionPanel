import { IsString, IsNumber } from 'class-validator';

export class LogsDto {

    @IsString()
    public label: string;

    @IsString()
    public description: string;

    @IsString()
    public status: string;

    @IsNumber()
    public duration: number;

}