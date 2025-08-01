import { IsString, IsNumber } from 'class-validator';

export class RequestsDto {

    @IsNumber()
    public redirectionId: number;

    @IsString()
    public requestIp: string;

}