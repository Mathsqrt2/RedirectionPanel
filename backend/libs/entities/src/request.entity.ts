import { Entity, Column, Timestamp, Generated } from "typeorm";
import { BasicPropertiesEntity } from "./base.entity";

@Entity({ name: `requests` })
export class Request extends BasicPropertiesEntity {

    @Column()
    public redirectionId: number;

    @Column()
    public requestIp: string;

    @Generated()
    public requestTime: Timestamp;

}