import { DataSource } from "typeorm";
import { Secrets } from "./secrets.entity";

export const secretsProviders = [
    {
        provide: `SECRETS`,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Secrets),
        inject: [`DATA_SOURCE`],
    }
]