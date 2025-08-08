import { DatabaseController } from "./database.controller";
import { LoggerService } from "../utils/logs.service";
import { DatabaseService } from "./database.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import * as Entities from "./entities";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: `mysql`,
                host: process.env.DBHOST,
                port: +process.env.DBPORT,
                username: process.env.DBUSERNAME,
                password: process.env.DBPASSWORD,
                database: process.env.DATABASE,
                entities: Object.values(Entities),
            })
        }),
    ],
    controllers: [
        DatabaseController
    ],
    providers: [
        LoggerService,
        DatabaseService,
    ],
    exports: [
        LoggerService,
        DatabaseService,
        TypeOrmModule.forFeature(Object.values(Entities))
    ],
})

export class DatabaseModule { }
