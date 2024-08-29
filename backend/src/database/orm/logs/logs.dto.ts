import { IsString, IsNumber, IsDate } from 'class-validator';

export class LogsDto {

    @IsString()
    label: string;

    @IsString()
    description: string;

    @IsDate()
    creationTime: Date;

}