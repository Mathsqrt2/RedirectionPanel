import { Inject, Injectable } from "@nestjs/common";
import { Repository } from 'typeorm';
import { SHA256 } from 'crypto-js'
import { HttpStatus } from "@nestjs/common";
import { createSingleElementProps, CRUDTypes, createMultipleElementsProps, DatabaseOutput, getSingleElementByIdProps, getMultipleElementsByParamProps, getMultipleElementsProps, deleteMultipleElementsByParamProps, deleteSingleElementByIdProps, patchMultipleElementsByParamProps, patchSingleElementProps, updateSingleElementProps, DTOs } from "./database.types";
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
        return
    }

    getSingleElementById = async ({ endpoint, id }: getSingleElementByIdProps): Promise<DatabaseOutput> => {
        return
    }

    getMultipleElementsByParam = async ({ endpoint, param, value, maxCount, offset }: getMultipleElementsByParamProps): Promise<DatabaseOutput> => {
        return
    }

    createMultipleElements = async ({ endpoint, dataArray }: createMultipleElementsProps): Promise<DatabaseOutput> => {
        return
    }

    createSingleElement = async ({ endpoint, data }: createSingleElementProps): Promise<DatabaseOutput> => {

        const model = this.recognizeModel(endpoint);
        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);
        const content = await model.save(data);

        return content;
    }

    updateSingleElement = async ({ endpoint, id, data }: updateSingleElementProps): Promise<DatabaseOutput> => {
        return
    }

    patchSingleElement = async ({ endpoint, id, data }: patchSingleElementProps): Promise<DatabaseOutput> => {
        return
    }

    patchMultipleElementsByParam = async ({ endpoint, param, value, data }: patchMultipleElementsByParamProps): Promise<DatabaseOutput> => {
        return
    }

    deleteSingleElementById = async ({ endpoint, id }: deleteSingleElementByIdProps): Promise<DatabaseOutput> => {
        return
    }

    deleteMultipleElementsByParam = async ({ endpoint, param, value }: deleteMultipleElementsByParamProps): Promise<DatabaseOutput> => {
        return
    }
}