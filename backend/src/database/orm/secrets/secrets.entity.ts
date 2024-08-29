import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated } from "typeorm";

@Entity()
export class Secrets {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    decryptionKey: string;

    @Generated()
    creationTime: Timestamp;

    @Column()
    expirationTime: number;

}