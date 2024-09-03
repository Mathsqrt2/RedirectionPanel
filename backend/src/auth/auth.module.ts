import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "src/database/database.module";
import config from "src/config";

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: config.secret,
            global: true,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [
        AuthService,
    ],
    controllers: [AuthController],
    exports: [AuthService]
})

export class AuthModule { }