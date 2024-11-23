import { providers } from "../database/database.module";
import { LoggerService } from "../utils/logs.service";
import { AuthController } from "./auth.controller";
import { CodeService } from "../code/code.service";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({
            secret: process.env.SECRET,
            global: true,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        LoggerService,
        AuthService,
        CodeService,
        ...providers],
    exports: [AuthService],
})

export class AuthModule { }