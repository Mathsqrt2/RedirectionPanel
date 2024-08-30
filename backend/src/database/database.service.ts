import { Inject, Injectable } from "@nestjs/common";
import { Repository } from 'typeorm';
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

    getMultipleElements = async ({ endpoint, maxCount, offset = 0 }: getMultipleElementsProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {
            const response = await model.find();

            if (maxCount) {
                response.filter((_, i, arr) => i >= arr.length - 1 - offset - (maxCount - 1) && i <= arr.length - 1 - offset);
            }

            this.logs.save({
                label: `${response.length} elements found successfully on "${endpoint}"`,
                description: `Search on "${endpoint}", endpoint: ${endpoint}, maxCount: ${maxCount}, offset: ${offset}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.FOUND, content: response };

        } catch (err) {

            console.log(`getMultipleElements error: `, err);
            this.logs.save({
                label: `Error while trying to get multiple elements`,
                description: `Couldn't get elements on: "${endpoint}", maxCount: ${maxCount}, offset: ${offset}. getMultipleElements error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't get elements on: "${endpoint}"`,
            }
        }
    }

    getSingleElementById = async ({ endpoint, id }: getSingleElementByIdProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const response = await model.findOneBy({ id });

            this.logs.save({
                label: `Item found successfully on "${endpoint}"`,
                description: `Search on "${endpoint}", endpoint: ${endpoint}, id: ${id}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return response

        } catch (err) {

            console.log(`getSingleElementById error: `, err);
            this.logs.save({
                label: `Error while trying to get single element`,
                description: `Couldn't get element with id: "${id}" on: "${endpoint}". getSingleElementById error: ${err}. ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't get element with id: "${id}" on: "${endpoint}"`,
            }

        }
    }

    getMultipleElementsByParam = async ({ endpoint, param, value, maxCount, offset = 0 }: getMultipleElementsByParamProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const query = {}
            query[param] = value;
            const response = await model.findBy(query);

            if (maxCount) {
                response.filter((_, i, arr) => i >= arr.length - 1 - offset - (maxCount - 1) && i <= arr.length - 1 - offset);
            }

            this.logs.save({
                label: `${response.length} item found successfully on "${endpoint}"`,
                description: `Search on "${endpoint}", query: {${param}:${value}}, maxCount: ${maxCount}, offset: ${offset}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.FOUND, content: response };

        } catch (err) {

            console.log(`getMultipleElementsByParam error: `, err);
            this.logs.save({
                label: `Error while geting multiple elements by param`,
                description: `Couldn't get multiple elements by {${param}:${value}} on: "${endpoint}",
                    maxCount: ${maxCount}, offset: ${offset}, getMultipleElementsByParam error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't get elements {${param}:${value}} on: "${endpoint}"`,
            }

        }
    }

    createMultipleElements = async ({ endpoint, dataArray }: createMultipleElementsProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const response = [];
            for (let item of dataArray) {
                const content = await model.save({ ...item });
                response.push(content);
            }

            this.logs.save({
                label: `${dataArray.length} items created successfully on "${endpoint}"`,
                description: `endpoint: ${endpoint}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.CREATED, content: response };

        } catch (err) {

            console.log(`createMultipleElements error: `, err);
            this.logs.save({
                label: `Error while trying to create multiple elements`,
                description: `Couldn't create ${dataArray.length} elements on "${endpoint}". createMultipleElements error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't create ${dataArray.length} elements on "${endpoint}"`,
            }

        }

    }

    createSingleElement = async ({ endpoint, data }: createSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const response = await model.save(data);

            this.logs.save({
                label: `Single item created successfully on "${endpoint}"`,
                description: `endpoint: ${endpoint}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.CREATED, content: response };

        } catch (err) {

            console.log(`createSingleElement error: `, err);
            this.logs.save({
                label: `Error while trying to create single element`,
                description: `Couldn't create single element on "${endpoint}". createSingleElement error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't create single element on "${endpoint}"`,
            }

        }
    }

    updateSingleElement = async ({ endpoint, id, data }: updateSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const instance = await model.findOneBy({ id });
            const response = await model.save({ ...instance, ...data });

            this.logs.save({
                label: `Item with id: ${id} updated successfully on "${endpoint}"`,
                description: `endpoint: ${endpoint}, element id: ${id}, new data: ${data}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            console.log(`updateSingleElement error: `, err);
            this.logs.save({
                label: `Error while trying to update single element`,
                description: `Couldn't update single element with id: "${id}" on "${endpoint}". updateSingleElement error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't update single element with id: "${id}" on "${endpoint}"`,
            }

        }

    }

    patchSingleElement = async ({ endpoint, id, data }: patchSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const instance = await model.findOneBy({ id });
            const response = await model.save({ ...instance, ...data });

            this.logs.save({
                label: `Item with id: "${id}" patched successfully on "${endpoint}"`,
                description: `endpoint: ${endpoint}, id: ${id}, new data: ${data}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            console.log(`patchSingleElement error: `, err);
            this.logs.save({
                label: `Error while trying to patch single element`,
                description: `Couldn't patch single element with id: "${id}" on "${endpoint}". patchSingleElement error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't patch single element with id: "${id}" on "${endpoint}"`,
            }

        }
    }

    patchMultipleElementsByParam = async ({ endpoint, param, value, data }: patchMultipleElementsByParamProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {
            const response = [];
            const query = {};
            query[param] = value;
            const instances = await model.findBy(query);
            for (let instance of instances) {
                const item = await model.save({ ...instance, ...data });
                response.push(item);
            }

            this.logs.save({
                label: `${response.length} items patched successfully on "${endpoint}"`,
                description: `endpoint: ${endpoint}, items: ${response.length}, query: {${param}:${value}}. New data: ${data}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            console.log(`patchMultipleElementsByParam error: `, err);
            this.logs.save({
                label: `Error while trying to patch multiple elements`,
                description: `Couldn't patch ${data.length} elements found by: {${param}:${value}} on "${endpoint}". patchMultipleElementsByParam error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't patch multiple elements found by: {${param}:${value}} on "${endpoint}"`,
            }

        }
    }

    deleteSingleElementById = async ({ endpoint, id }: deleteSingleElementByIdProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const item = await model.findOneBy({ id });
            const status = await model.delete({ id });
            const response = { ...status, raw: { ...item } };

            this.logs.save({
                label: `Items with ID: ${id} deleted successfully on "${endpoint}"`,
                description: `endpoint: ${endpoint}, item: ${JSON.stringify(response)}, id: "${id}". ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            console.log(`deleteSingleElementById error: `, err);
            this.logs.save({
                label: `Error while trying to delete single element`,
                description: `Couldn't delete single element with id: "${id}" on "${endpoint}". deleteSingleElementById error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't delete single element with id: "${id}" on "${endpoint}"`,
            }

        }
    }

    deleteMultipleElementsByParam = async ({ endpoint, param, value }: deleteMultipleElementsByParamProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const query = {};
            query[param] = value;

            const item = await model.findBy(query);
            const status = await model.delete(query);
            const response = { ...status, raw: [...item] };

            this.logs.save({
                label: `${response?.raw?.length} items deleted successfully on "${endpoint}"`,
                description: `endpoint: ${endpoint}, items: ${JSON.stringify(response)}, query: {${param}:${value}}. ${new Date()}`,
                status: `success`,
                duration: Date.now() - startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            console.log(`deleteMultipleElementsByParam error: `, err);
            this.logs.save({
                label: `Error while trying to delete multiple element`,
                description: `Couldn't delete multiple elements found by: {${param}:${value}} on "${endpoint}". deleteMultipleElementsByParam error: ${err} ${new Date()}`,
                status: `failed`,
                duration: Date.now() - startTime,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't delete multiple elements found by {${param}:${value}} on "${endpoint}"`,
            }

        }

    }
}