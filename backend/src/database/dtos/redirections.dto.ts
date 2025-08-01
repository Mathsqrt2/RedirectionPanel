import { IsString, IsNumber } from 'class-validator';

export class RedirectionsDto {

    @IsString()
    public targetUrl: string;

    @IsString()
    public route: string;

    @IsString()
    public category: string;

    @IsNumber()
    public user: number;

}