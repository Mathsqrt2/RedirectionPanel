import { IsString, IsDate, IsNumber } from 'class-validator';

export class LogsDto {

    @IsString()
    label: string;

    @IsString()
    description: string;

    @IsString()
    status: string;

    @IsNumber()
    duration: number;

}