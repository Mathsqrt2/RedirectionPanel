import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../database/database.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import config from "../config";
import { LoggerService } from "../utils/logs.service";

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: config.secret,
            global: true,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LoggerService],
    exports: [AuthService],
})

export class AuthModule { }