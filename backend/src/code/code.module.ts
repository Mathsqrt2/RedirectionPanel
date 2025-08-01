import { DatabaseModule } from "src/database/database.module";
import { LoggerService } from "../utils/logs.service";
import { CodeController } from "./code.controller";
import { CodeService } from "./code.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        DatabaseModule,
    ],
    controllers: [
        CodeController
    ],
    providers: [
        CodeService,
        LoggerService
    ],
})

export class CodeModule { }