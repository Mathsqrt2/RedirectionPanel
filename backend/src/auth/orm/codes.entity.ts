import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated } from "typeorm";

@Entity()
export class Codes {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    userId: number;

    @Column()
    status: boolean;

    @Column()
    expireDate: number;

    @Column()
    email: string;

    @Generated()
    timestamp: Timestamp;

}