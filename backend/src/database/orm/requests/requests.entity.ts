import {
    Entity, Column, PrimaryGeneratedColumn,
    Timestamp, Generated
} from "typeorm";

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

    @Column()
    jstimestamp: number;

}