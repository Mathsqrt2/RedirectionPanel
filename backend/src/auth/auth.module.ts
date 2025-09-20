import { DatabaseModule } from "../database/database.module";
import { CodeService } from "../code/code.service";
import { AuthController } from "./auth.controller";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { LoggerService } from "@libs/logger";
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({
            secret: process.env.SECRET,
            global: true,
            signOptions: { expiresIn: '7d' },
        }),
        DatabaseModule,
    ],
    controllers: [
        AuthController
    ],
    providers: [
        LoggerService,
        AuthService,
        CodeService,
    ],
    exports: [AuthService],
})

export class AuthModule { }