import { ConflictException, Inject, Injectable } from "@nestjs/common";
import {
    Repository, DataSource, LessThanOrEqual,
    MoreThanOrEqual, Between
} from 'typeorm';
import { HttpStatus } from "@nestjs/common";
import {
    createSingleElementProps, CRUDTypes, createMultipleElementsProps,
    DatabaseOutput, getSingleElementByIdProps, getMultipleElementsByParamProps,
    getMultipleElementsProps, deleteMultipleElementsByParamProps,
    deleteSingleElementByIdProps, patchMultipleElementsByParamProps,
    patchSingleElementProps, updateSingleElementProps
} from "./database.types";
import { Users } from "./orm/users/users.entity";
import { Requests } from "./orm/requests/requests.entity";
import { Redirections } from "./orm/redirections/redirections.entity";
import { Logs } from "./orm/logs/logs.entity";
import { Codes } from "src/auth/orm/codes.entity";
import { LoggerService } from "src/utils/logs.service";

@Injectable()
export class DatabaseService {

    private timezoneOffset = new Date().getTimezoneOffset() * 1000 * 60;
    private offset = (-1000 * 60 * 60 * 24) - this.timezoneOffset;

    constructor(
        @Inject(`REDIRECTIONS`) private redirections: Repository<Redirections>,
        @Inject(`REQUESTS`) private requests: Repository<Requests>,
        @Inject('CODES') private codes: Repository<Codes>,
        @Inject(`USERS`) private users: Repository<Users>,
        @Inject(`LOGS`) private logs: Repository<Logs>,
        private dataSource: DataSource,
        private logger: LoggerService,
    ) { }

    private getEntity = (endpoint: string) => {
        switch (endpoint) {
            case 'logs': return Logs;
            case 'redirections': return Redirections;
            case 'requests': return Requests;
            case 'users': return Users;
            case 'codes': return Codes;
            default: throw new Error(`Endpoint: "${endpoint}" doesn't exist.`);
        }
    }

    private recognizeModel = (endpoint: string): Repository<CRUDTypes> => {
        switch (endpoint) {
            case 'logs': return this.logs;
            case 'redirections': return this.redirections;
            case 'requests': return this.requests;
            case 'users': return this.users;
            case 'codes': return this.codes;
            default: throw new Error(`Endpoint: "${endpoint}" doesn't exist.`);
        }
    }

    public getMultipleElements = async ({ endpoint, conditions }: getMultipleElementsProps): Promise<DatabaseOutput> => {

        const { minDate, maxDate, maxCount, offset = 0 } = conditions;
        const startTime = Date.now();

        try {
            let response: CRUDTypes;

            if (maxDate || minDate) {
                const entity = this.getEntity(endpoint);

                if (!entity) throw new Error(`Entity for ${endpoint} doesn't exist`);

                let query = {};

                if (maxDate && minDate) {
                    query['jstimestamp'] = Between(new Date(new Date(minDate).getTime() - this.timezoneOffset).getTime(), new Date(new Date(maxDate).getTime() - this.offset).getTime());
                } else if (minDate) {
                    query['jstimestamp'] = MoreThanOrEqual(new Date(new Date(minDate).getTime() - this.timezoneOffset).getTime());
                } else if (maxDate) {
                    query['jstimestamp'] = LessThanOrEqual(new Date(new Date(maxDate).getTime() - this.offset).getTime());
                }

                response = await this.dataSource.getRepository(entity).findBy(query)
            } else {
                const model = this.recognizeModel(endpoint);

                if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

                response = await model.find();
            }

            if (maxCount) {
                response = response.filter((_, i, arr) => i >= arr.length - 1 - offset - (maxCount - 1) && i <= arr.length - 1 - offset);
            }

            this.logger.success({
                label: `${response.length} elements found.`,
                description: `endpoint: "${endpoint}", maxCount: "${maxCount}", offset: "${offset}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.FOUND, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to get multiple elements`,
                description: `Couldn't get elements on: "${endpoint}", maxCount: "${maxCount}", offset: "${offset}". getMultipleElements error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't get elements on: "${endpoint}"`,
            }
        }
    }

    public getSingleElementById = async ({ endpoint, id }: getSingleElementByIdProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const response = await model.findOneBy({ id });

            this.logger.success({
                label: `Single element found`,
                description: `endpoint: "${endpoint}", id: "${id}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return response

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to get single element`,
                description: `Couldn't get element with id: "${id}" on: "${endpoint}". getSingleElementById error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't get element with id: "${id}" on: "${endpoint}"`,
            }

        }
    }

    public getMultipleElementsByParam = async ({ endpoint, param, value, conditions }: getMultipleElementsByParamProps): Promise<DatabaseOutput> => {

        const { minDate, maxDate, maxCount, offset = 0 } = conditions;
        const startTime = Date.now();

        try {
            let response: CRUDTypes[];
            let query = {};

            if (maxDate || minDate) {

                const entity = this.getEntity(endpoint);
                if (!entity) throw new Error(`Entity for ${endpoint} doesn't exist`);

                if (maxDate && minDate) {
                    query['jstimestamp'] = Between(new Date(new Date(minDate).getTime() - this.timezoneOffset).getTime(), new Date(new Date(maxDate).getTime() - this.offset).getTime());
                } else if (minDate) {
                    query['jstimestamp'] = MoreThanOrEqual(new Date(new Date(minDate).getTime() - this.timezoneOffset).getTime());
                } else if (maxDate) {
                    query['jstimestamp'] = LessThanOrEqual(new Date(new Date(maxDate).getTime() - this.offset).getTime());
                }

                query[param] = value;
                response = await this.dataSource.getRepository(entity).findBy(query)
            } else {

                const model = this.recognizeModel(endpoint);
                if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

                query[param] = value;
                response = await model.findBy(query);
            }

            if (maxCount) {
                response = response.filter((_, i, arr) => i >= arr.length - 1 - offset - (maxCount - 1) && i <= arr.length - 1 - offset);
            }

            this.logger.success({
                label: `${response.length} items found`,
                description: `Search on "${endpoint}", query: "{${param}:${value}}", maxCount: "${maxCount}", offset: "${offset}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.FOUND, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while geting multiple elements by param`,
                description: `Couldn't get multiple elements by "{${param}:${value}}" on: "${endpoint}",
                    maxCount: "${maxCount}", offset: "${offset}", getMultipleElementsByParam error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't get elements {${param}:${value}} on: "${endpoint}"`,
            }

        }
    }


    public createSingleElement = async ({ endpoint, data }: createSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            if (endpoint === 'redirections') {
                const redirection = await model.findOneBy({ route: data.route });

                if (redirection) {
                    throw new ConflictException(`This redirection already exists`);
                }
            }

            const response = await model.save({
                ...data,
                jstimestamp: Date.now(),
            });

            this.logger.success({
                label: `Single item created`,
                description: `endpoint: ${endpoint}, Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.CREATED, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to create single element`,
                description: `Couldn't create single element on "${endpoint}". createSingleElement error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't create single element on "${endpoint}"`,
            }

        }
    }

    public createMultipleElements = async ({ endpoint, dataArray }: createMultipleElementsProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const response = [];
            for (let item of dataArray) {

                if (endpoint === 'redirections') {
                    const redirection = await model.findOneBy({ route: item.route });

                    if (redirection) {
                        const err = new Error(`Redirection with this route already exists`)
                        this.logger.fail({
                            label: `Couldn't create one of multiple redirections`,
                            description: `Couldn't create ${dataArray.length} element on "${endpoint}", data: "${JSON.stringify(item)}".
                            createMultipleElements error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                            startTime, err,
                        })
                        continue;
                    }
                }

                const content = await model.save({
                    ...item,
                    jstimestamp: Date.now()
                });
                response.push(content);
            }

            this.logger.success({
                label: `${dataArray.length} items created`,
                description: `endpoint: "${endpoint}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.CREATED, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to create multiple elements`,
                description: `Couldn't create ${dataArray.length} elements on "${endpoint}". createMultipleElements error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't create ${dataArray.length} elements on "${endpoint}"`,
            }

        }

    }

    public updateSingleElement = async ({ endpoint, id, data }: updateSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const instance = await model.findOneBy({ id });
            const response = await model.save({ ...instance, ...data });

            this.logger.success({
                label: `Item with id: ${id} updated`,
                description: `endpoint: "${endpoint}", element id: "${id}", new data: "${JSON.stringify(data)}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to update single element`,
                description: `Couldn't update single element with id: "${id}" on "${endpoint}". updateSingleElement error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't update single element with id: "${id}" on "${endpoint}"`,
            }

        }

    }

    public patchSingleElement = async ({ endpoint, id, data }: patchSingleElementProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const instance = await model.findOneBy({ id });
            const response = await model.save({ ...instance, ...data });

            this.logger.success({
                label: `Item with id: "${id}" patched`,
                description: `endpoint: "${endpoint}", id: "${id}", new data: "${JSON.stringify(data)}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to patch single element`,
                description: `Couldn't patch single element with id: "${id}" on "${endpoint}". patchSingleElement error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't patch single element with id: "${id}" on "${endpoint}"`,
            }

        }
    }

    public patchMultipleElementsByParam = async ({ endpoint, param, value, data }: patchMultipleElementsByParamProps): Promise<DatabaseOutput> => {

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

            this.logger.success({
                label: `${response.length} items patched`,
                description: `endpoint: "${endpoint}", items: ${response.length}, query: "{${param}:${value}}". New data: "${JSON.stringify(data)}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to patch multiple elements`,
                description: `Couldn't patch ${data.length} elements found by: "{${param}:${value}}" on "${endpoint}". patchMultipleElementsByParam error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't patch multiple elements found by: {${param}:${value}} on "${endpoint}"`,
            }

        }
    }

    public deleteSingleElementById = async ({ endpoint, id }: deleteSingleElementByIdProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const item = await model.findOneBy({ id });
            const status = await model.delete({ id });
            const response = { ...status, raw: { ...item } };

            this.logger.success({
                label: `Item with ID: ${id} deleted`,
                description: `endpoint: "${endpoint}", item: "${JSON.stringify(response)}", id: "${id}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to delete single element`,
                description: `Couldn't delete single element with id: "${id}" on "${endpoint}". deleteSingleElementById error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't delete single element with id: "${id}" on "${endpoint}"`,
            }

        }
    }

    public deleteMultipleElementsByParam = async ({ endpoint, param, value }: deleteMultipleElementsByParamProps): Promise<DatabaseOutput> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`Model for ${endpoint} doesn't exist`);

        try {

            const query = {};
            query[param] = value;

            const item = await model.findBy(query);
            const status = await model.delete(query);
            const response = { ...status, raw: [...item] };

            this.logger.success({
                label: `${response?.raw?.length} items deleted`,
                description: `endpoint: "${endpoint}", items: "${JSON.stringify(response)}", query: "{${param}:${value}}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.OK, content: response };

        } catch (err) {

            this.logger.fail({
                label: `Error while trying to delete multiple element`,
                description: `Couldn't delete multiple elements found by: "{${param}:${value}}" on "${endpoint}". deleteMultipleElementsByParam error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't delete multiple elements found by {${param}:${value}} on "${endpoint}"`,
            }

        }

    }
}