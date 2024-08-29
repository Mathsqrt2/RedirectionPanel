import { DataSource } from "typeorm";
import { Logs } from "./logs.entity";

export const logsProviders = [
    {
        provide: `LOGS`,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Logs),
        inject: [`DATA_SOURCE`],
    }
]