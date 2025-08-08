import { LoggerProps } from "../../libs/types/src/property.types";
import { Inject, Injectable } from "@nestjs/common";
import { Logs } from "../database/entities/logs.entity";
import { Repository } from "typeorm";

@Injectable()
export class LoggerService {

    constructor(
        @Inject('LOGS') private readonly logs: Repository<Logs>,
    ) { }

    public fail = async ({ label, description, startTime, err }: LoggerProps): Promise<string> => {

        console.log(`${label} error: `, err?.message ? err.message : err);
        await this.logs.save({
            label, description, status: `failed`,
            jstimestamp: Date.now(), duration: (Date.now() - startTime)
        });

        return label;
    }

    public success = async ({ label, description, startTime }: LoggerProps): Promise<string> => {

        await this.logs.save({
            label, description, status: `success`,
            jstimestamp: Date.now(), duration: (Date.now() - startTime)
        });

        return label;
    }

    public completed = async ({ label, description, startTime }: LoggerProps): Promise<string> => {

        await this.logs.save({
            label, description, status: `completed`,
            jstimestamp: Date.now(), duration: (Date.now() - startTime)
        });

        return label;
    }

    public created = async ({ label, description, startTime }: LoggerProps): Promise<string> => {

        await this.logs.save({
            label, description, status: `created`,
            jstimestamp: Date.now(), duration: (Date.now() - startTime)
        });

        return label;
    }

    public received = async ({ label, description, startTime }: LoggerProps): Promise<string> => {

        await this.logs.save({
            label, description, status: `received`,
            jstimestamp: Date.now(), duration: (Date.now() - startTime)
        });

        return label;
    }

    public updated = async ({ label, description, startTime }: LoggerProps): Promise<string> => {

        await this.logs.save({
            label, description, status: `updated`,
            jstimestamp: Date.now(), duration: (Date.now() - startTime)
        });

        return label;
    }

    public deleted = async ({ label, description, startTime }: LoggerProps): Promise<string> => {

        await this.logs.save({
            label, description, status: `deleted`,
            jstimestamp: Date.now(), duration: (Date.now() - startTime)
        });

        return label;
    }

    public authorized = async ({ label, description, startTime }: LoggerProps): Promise<string> => {

        await this.logs.save({
            label, description, status: `authorized`,
            jstimestamp: Date.now(), duration: (Date.now() - startTime)
        });

        return label;
    }
}