import {
    Entity, Column, Timestamp, Generated, Unique
} from "typeorm";
import { BasicPropertiesEntity } from "./base.entity";

@Entity()
@Unique(['login'])
export class Users extends BasicPropertiesEntity {

    @Column({ unique: true })
    login: string;

    @Column()
    password: string;

    @Column({ default: false })
    canDelete: boolean;

    @Column({ default: false })
    canUpdate: boolean;

    @Column({ default: false })
    canCreate: boolean;

    @Column({ default: false })
    canManage: boolean;

    @Column({ default: null })
    email: string;

    @Column({ default: null })
    emailSent: boolean;

    @Generated()
    creationTime: Timestamp;

}