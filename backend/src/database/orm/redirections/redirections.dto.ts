import { IsString, IsNumber, IsDate } from 'class-validator';

export class RedirectionsDto {

    @IsString()
    targetUrl: string;

    @IsString()
    route: string;

    @IsNumber()
    userId: number;

}