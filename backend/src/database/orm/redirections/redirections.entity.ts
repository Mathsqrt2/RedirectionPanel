import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, OneToMany, ManyToOne } from "typeorm";
import { Users as User } from "../users/users.entity";
import { Requests as Request } from "../requests/requests.entity";

@Entity()
export class Redirections {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    targetUrl: string;

    @Column()
    route: string;

    @OneToMany(() => Request, request => request.redirection)
    requests: Request[];

    @ManyToOne(() => User, user => user.redirections)
    user: User;

    @Generated()
    creationTime: Timestamp;

}