import { LoggerService } from "../utils/logs.service";
import { AuthController } from "./auth.controller";
import { CodeService } from "../code/code.service";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "src/database/database.module";

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
    controllers: [AuthController],
    providers: [
        LoggerService,
        AuthService,
        CodeService,
    ],
    exports: [AuthService],
})

export class AuthModule { }