import { IsString, IsNumber, IsDate } from 'class-validator';

export class RequestsDto {

    @IsNumber()
    id: number;

    @IsNumber()
    redirectionId: number;
    
    @IsDate()
    requestTime: Date;

    @IsString()
    requestIp: string;

}