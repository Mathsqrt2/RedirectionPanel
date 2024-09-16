import { Module } from "@nestjs/common";
import { RedirectionsController } from "./redirections.controller";
import { providers } from "../database/database.module";
import { LoggerService } from "../utils/logs.service";

@Module({
    controllers: [RedirectionsController],
    providers: [
        LoggerService,
        ...providers
    ],
})

export class RedirectionsModule { }