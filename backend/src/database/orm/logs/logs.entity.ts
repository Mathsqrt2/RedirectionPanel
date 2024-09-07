import {
    Entity, Column, PrimaryGeneratedColumn,
    Timestamp, Generated
} from "typeorm";

@Entity()
export class Logs {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;

    @Column()
    description: string;

    @Column()
    status: string;

    @Column()
    duration: number;

    @Column()
    jstimestamp: number;

    @Generated()
    timestamp: Timestamp;


}