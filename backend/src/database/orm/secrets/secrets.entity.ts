import { Entity, Column, PrimaryGeneratedColumn, Timestamp, Generated, Unique } from "typeorm";

@Entity()
@Unique(['decryptionKey'])
export class Secrets {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    decryptionKey: string;

    @Generated()
    creationTime: Timestamp;

    @Column()
    expirationTime: Number;

    @Column()
    status: string;

}