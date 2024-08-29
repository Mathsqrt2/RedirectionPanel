import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, ManyToOne } from "typeorm";
import { RedirectionsEntity as Redirection } from "../redirections/redirections.entity";

@Entity()
export class RequestsEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Redirection, redirection => redirection.id)
    redirectionId: Redirection;

    @Column()
    requestIp: string;

    @Generated()
    requestTime: Timestamp;

}