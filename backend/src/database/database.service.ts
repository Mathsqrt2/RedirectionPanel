import { Inject, Injectable } from "@nestjs/common";
import { Repository } from 'typeorm';
import { SHA256 } from 'crypto-js'
import { HttpStatus } from "@nestjs/common";
import {
    createSingleElementProps, CRUDTypes, createMultipleElementsProps,
    DatabaseOutput, getSingleElementByIdProps, getMultipleElementsByParamProps,
    getMultipleElementsProps, deleteMultipleElementsByParamProps,
    deleteSingleElementByIdProps, patchMultipleElementsByParamProps,
    patchSingleElementProps, updateSingleElementProps
} from "./database.types";
import { Users } from "./orm/users/users.entity";
import { Secrets } from "./orm/secrets/secrets.entity";
import { Requests } from "./orm/requests/requests.entity";
import { Redirections } from "./orm/redirections/redirections.entity";
import { Logs } from "./orm/logs/logs.entity";

@Injectable()
export class DatabaseService {

    constructor(
        @Inject(`LOGS`) private logs: Repository<Logs>,
        @Inject(`REDIRECTIONS`) private redirections: Repository<Redirections>,
        @Inject(`REQUESTS`) private requests: Repository<Requests>,
        @Inject(`SECRETS`) private secrets: Repository<Secrets>,
        @Inject(`USERS`) private users: Repository<Users>,
    ) { }

    private recognizeModel = (endpoint: string): Repository<CRUDTypes> => {
        switch (endpoint) {
            case 'logs': return this.logs;
            case 'redirections': return this.redirections;
            case 'requests': return this.requests;
            case 'secrets': return this.secrets;
            case 'users': return this.users;
            default: throw new Error(`Endpoint: "${endpoint}" doesn't exist.`);
        }
    }

    getMultipleElements = async ({ endpoint, maxCount, offset }: getMultipleElementsProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();

        try {
            const response = '';
            this.logs.save({
                label: `Successfully found`,
                description: ` "${endpoint}", ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })
            return response;

        } catch (err) {
            console.log(`getMultipleElementsByParam error:`, err);
            this.logs.save({
                label: `Error while geting multiple elements`,
                description: `Couldn't get elements on: "${endpoint}", ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })
        }
        return
    }

    getSingleElementById = async ({ endpoint, id }: getSingleElementByIdProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        return
    }

    getMultipleElementsByParam = async ({ endpoint, param, value, maxCount, offset }: getMultipleElementsByParamProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {
            const query = {}
            query[param] = value;
            const response = model.find(query);

            return response;
        } catch (err) {
            console.log(`getMultipleElementsByParam error:`, err);
        }
    }

    createMultipleElements = async ({ endpoint, dataArray }: createMultipleElementsProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        return
    }

    createSingleElement = async ({ endpoint, data }: createSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);
        const content = await model.save(data);

        return content;
    }

    updateSingleElement = async ({ endpoint, id, data }: updateSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        return
    }

    patchSingleElement = async ({ endpoint, id, data }: patchSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        return
    }

    patchMultipleElementsByParam = async ({ endpoint, param, value, data }: patchMultipleElementsByParamProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        return
    }

    deleteSingleElementById = async ({ endpoint, id }: deleteSingleElementByIdProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        return
    }

    deleteMultipleElementsByParam = async ({ endpoint, param, value }: deleteMultipleElementsByParamProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        return
    }
}