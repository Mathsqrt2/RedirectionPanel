import { BasicPropertiesEntity } from "./base.entity";
import { Entity, Column, Timestamp, Generated } from "typeorm";

@Entity()
export class Codes extends BasicPropertiesEntity {

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

}