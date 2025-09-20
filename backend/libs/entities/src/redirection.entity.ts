import { BasicPropertiesEntity } from "./base.entity";
import { Entity, Column, Unique } from "typeorm";

@Entity({ name: `redirections` })
@Unique([`route`])
export class Redirection extends BasicPropertiesEntity {

    @Column()
    public targetUrl: string;

    @Column({ unique: true })
    public route: string;

    @Column()
    public userId: number;

    @Column()
    public category: string;

}