import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [
        AuthController
    ],
    providers: [
        AuthService,
        JwtService,
    ],
})

export class AuthModule { }