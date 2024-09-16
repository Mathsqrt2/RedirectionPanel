import { providers } from "../database/database.module";
import { LoggerService } from "../utils/logs.service";
import { CodeController } from "./code.controller";
import { CodeService } from "./code.service";
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import config from "../config";

@Module({
    imports: [
        JwtModule.register({
            secret: config.secret,
            global: true,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [CodeController],
    providers: [CodeService, LoggerService, ...providers],
})

export class CodeModule { }