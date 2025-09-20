import { Entity, Column, Unique, CreateDateColumn } from "typeorm";
import { BasicPropertiesEntity } from "./base.entity";

@Entity()
@Unique(['login'])
export class User extends BasicPropertiesEntity {

    @Column({ unique: true })
    public login: string;

    @Column()
    public password: string;

    @Column({ default: false })
    public canDelete: boolean;

    @Column({ default: false })
    public canUpdate: boolean;

    @Column({ default: false })
    public canCreate: boolean;

    @Column({ default: false })
    public canManage: boolean;

    @Column({ default: null })
    public email?: string;

    @Column({ default: null })
    public emailSent?: boolean;

    @CreateDateColumn({ type: `timestamp with local time zone` })
    public creationTime: Date;

}