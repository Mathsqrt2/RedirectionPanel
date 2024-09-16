import { LoggerProps } from "../../../types/property.types";
import { Inject, Injectable } from "@nestjs/common";
import { Logs } from "../database/orm/logs/logs.entity";
import { Repository } from "typeorm";

@Injectable()
export class LoggerService {

    constructor(
        @Inject('LOGS') private readonly logs: Repository<Logs>,
    ) { }

    public success = async ({ label, description, startTime }: LoggerProps): Promise<string> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `success`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve(label);
        })
    }

    public fail = async ({ label, description, startTime, err }: LoggerProps): Promise<string> => {
        return new Promise(async (resolve) => {
            console.log(`${label} error: `, err?.message ? err.message : err);
            await this.logs.save({
                label, description, status: `failed`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve(label);
        })
    }

    public completed = async ({ label, description, startTime }: LoggerProps): Promise<string> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `completed`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve(label);
        })
    }

    public received = async ({ label, description, startTime }: LoggerProps): Promise<string> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `received`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve(label);
        })
    }

    public deleted = async ({ label, description, startTime }: LoggerProps): Promise<string> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `deleted`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve(label);
        })
    }

    public created = async ({ label, description, startTime }: LoggerProps): Promise<string> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `created`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve(label);
        })
    }

    public updated = async ({ label, description, startTime }: LoggerProps): Promise<string> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `updated`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve(label);
        })
    }

    public authorized = async ({ label, description, startTime }: LoggerProps): Promise<string> => {
        return new Promise(async (resolve) => {
            await this.logs.save({
                label, description, status: `authorized`,
                jstimestamp: Date.now(), duration: (Date.now() - startTime)
            });
            resolve(label);
        })
    }

}

