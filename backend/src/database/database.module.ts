import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { DatabaseController } from "./database.controller";
import { databaseProviders } from "./database.providers";
import { usersProviders } from "./orm/users/users.providers";
import { logsProviders } from "./orm/logs/logs.providers";
import { redirectionsProviders } from "./orm/redirections/redirections.providers";
import { requestsProviders } from "./orm/requests/requests.providers";
import { codesProviders } from "../auth/orm/codes.providers";
import { LoggerService } from "../utils/logs.service";


const providers = [
    LoggerService,
    DatabaseService,
    ...databaseProviders,
    ...logsProviders,
    ...redirectionsProviders,
    ...requestsProviders,
    ...usersProviders,
    ...codesProviders,
];

@Module({
    controllers: [
        DatabaseController
    ],
    providers,
    exports: providers,
})

export class DatabaseModule { }
