import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated } from "typeorm";

@Entity()
export class SecretsEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    decryptionKey: string;

    @Generated()
    creationTime: string;

    @Column()
    expirationTime: Timestamp;

}