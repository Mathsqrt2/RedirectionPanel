import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { DatabaseController } from "./database.controller";
import { databaseProviders } from "./database.providers";
import { usersProviders } from "./orm/users/users.providers";
import { logsProviders } from "./orm/logs/logs.providers";
import { redirectionsProviders } from "./orm/redirections/redirections.providers";
import { requestsProviders } from "./orm/requests/requests.providers";
import { verifyProviders } from "src/auth/orm/verifyEmail.providers";

const providers = [
    DatabaseService,
    ...databaseProviders,
    ...logsProviders,
    ...redirectionsProviders,
    ...requestsProviders,
    ...usersProviders,
    ...verifyProviders,
];

@Module({
    controllers: [
        DatabaseController
    ],
    providers: providers,
    exports: providers,
})

export class DatabaseModule { }
