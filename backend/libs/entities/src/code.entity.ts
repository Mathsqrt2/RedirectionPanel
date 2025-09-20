import { BasicPropertiesEntity } from "./base.entity";
import { Entity, Column } from "typeorm";

@Entity({ name: `codes` })
export class Code extends BasicPropertiesEntity {

    @Column({ type: `varchar`, length: 128, nullable: false })
    public code: string;

    @Column({ type: `integer`, nullable: false })
    public userId: number;

    @Column({ type: `boolean`, default: false })
    public status: boolean;

    @Column({ type: `timestamp with local time zone` })
    public expireDate: Date;

    @Column({ type: `varchar`, length: 128, nullable: false })
    public email: string;

}