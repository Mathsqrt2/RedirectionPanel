import { BasicPropertiesEntity } from "./base.entity";
import { Entity, Column, Unique } from "typeorm";

@Entity()
@Unique([`route`])
export class Redirections extends BasicPropertiesEntity {

    @Column()
    targetUrl: string;

    @Column({ unique: true })
    route: string;

    @Column()
    userId: number;

    @Column()
    category: string;

}