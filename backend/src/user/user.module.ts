import { providers } from "../database/database.module";
import { LoggerService } from "../utils/logs.service";
import { CodeService } from "../code/code.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
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
    controllers: [UserController],
    providers: [
        UserService,
        CodeService,
        LoggerService,
        ...providers
    ],
})

export class UserModule { }