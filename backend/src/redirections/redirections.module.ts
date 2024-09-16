import { Module } from "@nestjs/common";
import { RedirectionsController } from "./redirections.controller";
import { DatabaseModule } from "../database/database.module";
import { LoggerService } from "../utils/logs.service";

@Module({
    imports: [DatabaseModule],
    controllers: [RedirectionsController],
    providers: [LoggerService],
})

export class RedirectionsModule { }