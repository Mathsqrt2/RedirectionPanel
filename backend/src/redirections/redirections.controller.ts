import { Controller, Get, Inject, Ip, Param, Redirect } from "@nestjs/common";
import { SHA256 } from 'crypto-js';
import { Redirections } from "src/database/orm/redirections/redirections.entity";
import { Requests } from "src/database/orm/requests/requests.entity";
import { LoggerService } from "src/utils/logs.service";
import { Repository } from "typeorm";

@Controller(`:redirection`)

export class RedirectionsController {

    constructor(
        @Inject(`REDIRECTIONS`) private redirections: Repository<Redirections>,
        @Inject(`REQUESTS`) private requests: Repository<Requests>,
        private logger: LoggerService,

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

            this.logger.fail({
                label: `Redirection doesn't exist`,
                description: `Nothing was found for route "${redirection}", Request time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            this.loggedSearches.push(requestId);
        }

        if (url) {

            this.requests.save({ redirectionId: url.id, requestIp: ip, jstimestamp: Date.now() })
            this.logger.completed({
                label: `User redirected successfully`,
                description: `Client redirected by "${redirection}" to "${url?.targetUrl}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime
            })

            return { url: url?.targetUrl, status: 302 }
        }

        if (!this.loggedRequests.includes(requestId) && redirection !== 'not-found') {

            this.logger.fail({
                label: `Error while redirecting`,
                description: `Client couldn't be redirected to "${redirection}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            this.loggedRequests.push(requestId);
        }

        return { url: "/not-found", status: 404 };
    }

}