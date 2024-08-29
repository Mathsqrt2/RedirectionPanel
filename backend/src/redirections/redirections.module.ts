import { Module } from "@nestjs/common";
import { RedirectionsController } from "./redirections.controller";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [RedirectionsController],
})

export class RedirectionsModule { }