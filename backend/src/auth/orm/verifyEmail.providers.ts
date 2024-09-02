import { DataSource } from "typeorm";
import { VerifyEmail } from "./verifyEmail.entity";

export const verifyProviders = [
    {
        provide: `VERIFY`,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(VerifyEmail),
        inject: [`DATA_SOURCE`],
    }
]