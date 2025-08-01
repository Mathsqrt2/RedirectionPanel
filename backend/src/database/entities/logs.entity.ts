import { BasicPropertiesEntity } from "./base.entity";
import { Entity, Column } from "typeorm";

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

}