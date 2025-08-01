import { Entity, Column, Timestamp, Generated } from "typeorm";
import { BasicPropertiesEntity } from "./base.entity";

@Entity()
export class Requests extends BasicPropertiesEntity {

    @Column()
    redirectionId: number;

    @Column()
    requestIp: string;

    @Generated()
    requestTime: Timestamp;

}