import { DataSource } from "typeorm";
import { Users } from "./users.entity";

export const usersProviders = [
    {
        provide: `USERS`,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Users),
        inject: [`DATA_SOURCE`],
    }
]