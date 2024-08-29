import { DataSource } from "typeorm";
import { Redirections} from "./redirections.entity";

export const redirectionsProviders = [
    {
        provide: `REDIRECTIONS`,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Redirections),
        inject: [`DATA_SOURCE`],
    }
]