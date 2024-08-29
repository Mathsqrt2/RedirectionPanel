import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, OneToMany, ManyToOne } from "typeorm";
import { UsersEntity as User } from "../users/users.entity";
import { RequestsEntity as Request } from "../requests/requests.entity";

@Entity()
export class RedirectionsEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    targetUrl: string;

    @Column()
    route: string;

    @OneToMany(() => Request, request => request.id)
    requests: Request[];

    @ManyToOne(() => User, user => user.id)
    userId: User;

    @Generated()
    creationTime: Timestamp;

}