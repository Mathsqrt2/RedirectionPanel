import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, ManyToOne } from "typeorm";

@Entity()
export class Requests {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    redirectionId: number;

    @Column()
    requestIp: string;

    @Generated()
    requestTime: Timestamp;

}