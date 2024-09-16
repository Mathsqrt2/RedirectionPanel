import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../database/database.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import config from "../config";
import { LoggerService } from "../utils/logs.service";
import { CodeService } from "../code/code.service";
import { CodeModule } from "../code/code.module";

@Module({
    imports: [
        CodeModule,
        DatabaseModule,
        JwtModule.register({
            secret: config.secret,
            global: true,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LoggerService, CodeService],
    exports: [AuthService],
})

export class AuthModule { }