import { RedirectionsController } from "./redirections.controller";
import { DatabaseModule } from "src/database/database.module";
import { LoggerService } from "../utils/logs.service";
import { Module } from "@nestjs/common";

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