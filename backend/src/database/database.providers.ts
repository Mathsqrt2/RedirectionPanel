import { DataSource } from "typeorm";
import config from "src/config";

export const databaseProviders = [
    {
        provide: `DATA_SOURCE`,
        useFactory: async () => {
            const dataSource = new DataSource({
                type: `mysql`,
                host: config.database.host,
                port: 3306,
                username: config.database.username,
                password: config.database.password,
                database: config.database.database,
                entities: [
                    __dirname + `/../**/*.entity{.ts,.js}`,
                ],
                synchronize: false,
            });
            return dataSource.initialize();
        }
    }
]