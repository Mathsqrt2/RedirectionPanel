import { DataSource } from "typeorm";
import { Codes } from "./codes.entity";

export const codesProviders = [
    {
        provide: `CODES`,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Codes),
        inject: [`DATA_SOURCE`],
    }
]