import { IsString, IsNumber, IsDefined } from 'class-validator';

export class RequestsDto {

    @IsDefined()
    @IsNumber()
    public redirectionId: number;
    
    @IsDefined()
    @IsString()
    public requestIp: string;

}