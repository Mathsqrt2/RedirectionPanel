import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, OneToMany, Unique } from "typeorm";

@Entity()
@Unique(['login'])
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

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

    @Generated()
    creationTime: Timestamp;

}