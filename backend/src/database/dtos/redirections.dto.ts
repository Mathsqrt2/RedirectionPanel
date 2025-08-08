import { IsString, IsNumber, IsDefined } from 'class-validator';

export class RedirectionsDto {

    @IsDefined()
    @IsString()
    public targetUrl: string;
    
    @IsDefined()
    @IsString()
    public route: string;
    
    @IsDefined()
    @IsString()
    public category: string;
    
    @IsDefined()
    @IsNumber()
    public user: number;

}