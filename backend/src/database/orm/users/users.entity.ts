import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, OneToMany } from "typeorm";
import { RedirectionsEntity as Redirection } from "../redirections/redirections.entity";

@Entity()
export class UsersEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    login: string;

    @Column()
    password: string;

    @OneToMany(() => Redirection, redirection => redirection.id)
    redirections: Redirection[];

    @Column()
    canDelete: boolean;

    @Column()
    canUpdate: boolean;

    @Column()
    canCreate: boolean;

    @Column()
    canManage: boolean;

    @Column()
    accessKey: string;

    @Column()
    refreshKey: string;

    @Generated()
    creationTime: Timestamp;

}