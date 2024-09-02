import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated } from "typeorm";

@Entity()
export class VerifyEmail {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    userId: number;

    @Column()
    active: boolean;

    @Generated()
    timestamp: Timestamp;

}