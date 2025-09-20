import { BasicPropertiesEntity } from "./base.entity";
import { Entity, Column } from "typeorm";

@Entity({ name: `logs` })
export class Log extends BasicPropertiesEntity {

    @Column()
    public label: string;

    @Column()
    public description: string;

    @Column()
    public status: string;

    @Column()
    public duration: number;

}