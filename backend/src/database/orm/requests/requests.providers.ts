import { DataSource } from "typeorm";
import { Requests } from "./requests.entity";

export const requestsProviders = [
    {
        provide: `REQUESTS`,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Requests),
        inject: [`DATA_SOURCE`],
    }
]