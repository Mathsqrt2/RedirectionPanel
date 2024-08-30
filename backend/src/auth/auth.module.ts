import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { DatabaseModule } from "src/database/database.module";
import config from "src/config";

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            global: true,
            secret: config.secret,
            signOptions: { expiresIn: '14d' },
        }),
    ],
    providers: [
        JwtService,
        AuthService,
    ],
    controllers: [AuthController],
    exports: [AuthService]
})

export class AuthModule { }