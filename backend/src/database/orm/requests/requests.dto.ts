import { IsString, IsNumber } from 'class-validator';

export class RequestsDto {

    @IsNumber()
    redirectionId: number;

    @IsString()
    requestIp: string;

}