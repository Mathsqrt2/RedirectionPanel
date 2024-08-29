import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, ManyToOne } from "typeorm";
import { Redirections as Redirection } from "../redirections/redirections.entity";

@Entity()
export class Requests {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Redirection, redirection => redirection.requests)
    redirection: Redirection;

    @Column()
    requestIp: string;

    @Generated()
    requestTime: Timestamp;

}