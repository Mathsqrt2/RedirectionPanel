import { IsString, IsNumber } from 'class-validator';

export class RedirectionsDto {

    @IsString()
    targetUrl: string;

    @IsString()
    route: string;

    @IsString()
    category: string;

    @IsNumber()
    user: number;

}