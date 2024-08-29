import { IsString, IsNumber, IsDate } from 'class-validator';

export class RedirectionsDto {

    @IsString()
    targetUrl: string;

    @IsString()
    route: string;

    @IsDate()
    creationTime: Date;

    @IsNumber()
    userId: number;

}