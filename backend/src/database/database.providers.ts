import { DataSource } from "typeorm";

export const databaseProviders = [
    {
        provide: `DATA_SOURCE`,
        useFactory: async () => {
            const dataSource = new DataSource({
                type: `mysql`,
                host: process.env.DBHOST,
                port: process.env.DBPORT,
                username: process.env.DBUSERNAME,
                password: process.env.DBPASSWORD,
                database: process.env.DATABASE,
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
                    host: process.env.DBHOST,
                    port: process.env.DBPORT,
                    username: process.env.DBUSERNAME,
                    password: process.env.DBPASSWORD,
                    database: process.env.DATABASE,
                    synchronize: false,
                    entities: [
                        `${__dirname}/../**/**.entity{.ts,.js}`
                    ],
                });
                await dataSource.initialize();
                return dataSource;
            } catch (error) {
                console.log('Error connecting to database');
                throw error;
            }
        },
    },
]