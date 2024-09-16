import { providers } from "../database/database.module";
import { LoggerService } from "../utils/logs.service";
import { CodeController } from "./code.controller";
import { CodeService } from "./code.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [CodeController],
    providers: [CodeService, LoggerService, ...providers],
})

export class CodeModule { }