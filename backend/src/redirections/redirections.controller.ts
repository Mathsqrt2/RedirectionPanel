import { Controller, Get, Param, Redirect } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Controller(`:redirection`)

export class RedirectionsController {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    @Get()
    @Redirect()
    async redirectTo(
        @Param(`redirection`) redirection: string,
    ) {
        const url = await this.database.getMultipleElementsByParam({
            endpoint: `redirections`,
            param: `route`,
            value: redirection,
        });

        if (url.length) {
            return { url: url[0].targetUrl, status: 302 }
        }
        return { url: "/not-found", status: 404 }
    }

}