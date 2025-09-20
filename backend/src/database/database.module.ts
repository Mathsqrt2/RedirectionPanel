import { DatabaseController } from "./database.controller";
import { DatabaseService } from "./database.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerService } from "@libs/logger";
import * as Entities from "@libs/entities";
import { Module } from "@nestjs/common";

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
