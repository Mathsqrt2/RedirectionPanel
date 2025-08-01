import { RedirectionsController } from "./redirections.controller";
import { LoggerService } from "../utils/logs.service";
import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [
        DatabaseModule,
    ],
    controllers: [
        RedirectionsController
    ],
    providers: [
        LoggerService,
    ],
})

export class RedirectionsModule { }