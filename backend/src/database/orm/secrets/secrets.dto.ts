import { IsString, IsDate } from 'class-validator';

export class SecretsDto {

    @IsString()
    decryptionKey: string;

    @IsDate()
    expirationTime: Date;

    @IsString()
    status: string;

}