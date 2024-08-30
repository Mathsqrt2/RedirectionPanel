import { Controller, Get, Inject, Ip, Param, Redirect } from "@nestjs/common";
import { SHA256 } from 'crypto-js';
import { Logs } from "src/database/orm/logs/logs.entity";
import { Redirections } from "src/database/orm/redirections/redirections.entity";
import { Requests } from "src/database/orm/requests/requests.entity";
import { Repository } from "typeorm";

@Controller(`:redirection`)

export class RedirectionsController {

    constructor(
        @Inject(`LOGS`) private logs: Repository<Logs>,
        @Inject(`REDIRECTIONS`) private redirections: Repository<Redirections>,
        @Inject(`REQUESTS`) private requests: Repository<Requests>,
    ) { }

    private loggedRequests = [];
    private loggedSearches = [];

    private assignRequestID = (requestSubject: string, seed?: number): string => {
        return SHA256(`${requestSubject}.${seed ? seed : Date.now()}`).toString();
    }

    @Get()
    @Redirect()
    async redirectTo(
        @Param(`redirection`) redirection: string,
        @Ip() ip,
    ) {
        const startTime = Date.now();
        const requestId = this.assignRequestID(`${redirection}`, Math.floor(startTime / 1000));

        const url = await this.redirections.findOneBy({ route: redirection });

        if (!this.loggedSearches.includes(requestId) && !url && redirection !== 'not-found') {

            this.logs.save({
                label: `Redirection doesn't exist`,
                description: `Nothing was found for route "${redirection}". Request time: ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            this.loggedSearches.push(requestId);
        }

        if (url) {

            this.requests.save({
                redirectionId: url.id,
                requestIp: ip,
            })

            this.logs.save({
                label: `User redirected successfully`,
                description: `Client redirected by "${redirection}" to "${url?.targetUrl}", ${new Date()}`,
                status: `completed`,
                duration: Date.now() - startTime,
            });

            return { url: url?.targetUrl, status: 302 }
        }

        if (!this.loggedRequests.includes(requestId) && redirection !== 'not-found') {

            this.logs.save({
                label: `Error while redirecting`,
                description: `Client couldn't be redirected to "${redirection}", ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,

            })

            this.loggedRequests.push(requestId);
        }

        return { url: "/not-found", status: 404 };
    }

}