import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, OneToMany, ManyToOne, Unique } from "typeorm";

@Entity()
@Unique([`route`])
export class Redirections {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    targetUrl: string;

    @Column({ unique: true })
    route: string;

    @Column()
    userId: number;

    @Column()
    category: string;

    @Generated()
    creationTime: Timestamp;

}