import { IsString, IsDate, IsNumber } from 'class-validator';

export class SecretsDto {

    @IsString()
    decryptionKey: string;

    @IsDate()
    creationTime: Date;

    @IsDate()
    expirationTime: Date;

}