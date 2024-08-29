import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, OneToMany } from "typeorm";
import { Redirections as Redirection } from "../redirections/redirections.entity";

@Entity()
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    login: string;

    @Column()
    password: string;

    @OneToMany(() => Redirection, redirection => redirection.user)
    redirections: Redirection[];

    @Column({ default: false })
    canDelete: boolean;

    @Column({ default: false })
    canUpdate: boolean;

    @Column({ default: false })
    canCreate: boolean;

    @Column({ default: false })
    canManage: boolean;

    @Column()
    accessToken: string;

    @Column()
    refreshToken: string;

    @Generated()
    creationTime: Timestamp;

}