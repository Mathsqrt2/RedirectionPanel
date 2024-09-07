import { Inject, Injectable } from "@nestjs/common";
import { Logs } from "src/database/orm/logs/logs.entity";
import { Repository } from "typeorm";

@Injectable()
export class LoggerService {

    constructor(
        @Inject('LOGS') private readonly logs: Repository<Logs>,
    ) { }

    public success = async ({ label, description, startTime }: LoggerProps): Promise<void> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `success`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve();
        })
    }

    public fail = async ({ label, description, startTime, err }: LoggerProps): Promise<void> => {
        return new Promise(async (resolve) => {
            console.log(`${label} error: `, err.message);
            await this.logs.save({
                label, description, status: `failed`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve();
        })
    }

    public completed = async ({ label, description, startTime }: LoggerProps): Promise<void> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `completed`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve();
        })
    }

}

type LoggerProps = {
    label: string,
    description: string,
    startTime: number,
    err?: Error,
}