import { Controller, Get, Inject, Ip, Param, Redirect } from "@nestjs/common";
import { Request, Redirection } from "@libs/entities";
import { LoggerService } from "@libs/logger";
import { Repository } from "typeorm";
import { SHA256 } from 'crypto-js';
import { InjectRepository } from "@nestjs/typeorm";

@Controller(`:redirection`)

export class RedirectionsController {

    constructor(
        @InjectRepository(Redirection) private redirections: Repository<Redirection>,
        @InjectRepository(Request) private requests: Repository<Request>,
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
        let url: Redirection;

        try {
            url = await this.redirections.findOneBy({ route: redirection });

        } catch (err) {
            return { url: "/not-found", status: 404 };
        }

        if (!this.loggedSearches.includes(requestId) && !url && redirection !== 'not-found') {

            const err = new Error(`Path not found`);
            this.logger.fail({
                label: `Redirection not found`,
                description: `No data found for route "${redirection}", Request Time: "${new Date().toLocaleString('pl-PL')}".`,
                startTime, err
            })

            this.loggedSearches.push(requestId);
        }

        if (url) {
            this.requests.save({ redirectionId: url.id, requestIp: ip, jstimestamp: Date.now() })
            this.logger.completed({
                label: `User successfully redirected`,
                description: `Client redirected from "${redirection}" to "${url?.targetUrl}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                startTime
            })

            return { url: url?.targetUrl, status: 302 }
        }

        if (!this.loggedRequests.includes(requestId) && redirection !== 'not-found') {

            const err = new Error(`Redirection error`);
            this.logger.fail({
                label: `Redirection error`,
                description: `Client could not be redirected to "${redirection}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                startTime, err
            })

            this.loggedRequests.push(requestId);
        }

        return { url: "/not-found", status: 404 };
    }
}