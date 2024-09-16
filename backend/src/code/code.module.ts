import { Module } from "@nestjs/common";
import { CodeController } from "./code.controller";
import { CodeService } from "./code.service";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";
import config from "../config";
import { LoggerService } from "../utils/logs.service";

@Module({
    controllers: [CodeController],
    providers: [CodeService, LoggerService],
    imports: [DatabaseModule,
        JwtModule.register({
            secret: config.secret,
            global: true,
            signOptions: { expiresIn: '7d' },
        }),
    ],

})

export class CodeModule { }