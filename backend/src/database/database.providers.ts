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
    },
    {
        provide: DataSource,
        inject: [],
        useFactory: async () => {
            try {
                const dataSource = new DataSource({
                    type: `mysql`,
                    host: config.database.host,
                    port: 3306,
                    username: config.database.username,
                    password: config.database.password,
                    database: config.database.database,
                    synchronize: false,
                    entities: [
                        `${__dirname}/../**/**.entity{.ts,.js}`
                    ],
                });
                await dataSource.initialize();
                console.log('Database connected successfully');
                return dataSource;
            } catch (error) {
                console.log('Error connecting to database');
                throw error;
            }
        },
    },
]