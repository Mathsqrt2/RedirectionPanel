import { BeforeUpdate, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class BasicPropertiesEntity {

    @PrimaryGeneratedColumn({ type: "int" })
    public id: number;

    @CreateDateColumn({ type: `datetime` })
    public createdAt: Date;

    @Column({ type: `datetime`, nullable: true, default: null })
    public updatedAt?: Date;

    @BeforeUpdate()
    protected updateUpdatedAtProperty() {
        this.updatedAt = new Date();
    }

}