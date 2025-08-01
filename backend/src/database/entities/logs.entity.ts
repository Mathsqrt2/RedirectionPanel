import {
    Entity, Column, Timestamp, Generated
} from "typeorm";
import { BasicPropertiesEntity } from "./base.entity";

@Entity()
export class Logs extends BasicPropertiesEntity {

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