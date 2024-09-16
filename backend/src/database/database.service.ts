import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
    createSingleElementProps, CRUDTypes, createMultipleElementsProps,
    getSingleElementByIdProps, getMultipleElementsByParamProps,
    getMultipleElementsProps, deleteMultipleElementsByParamProps,
    deleteSingleElementByIdProps, patchMultipleElementsByParamProps,
    patchSingleElementProps, updateSingleElementProps
} from "../../../types/property.types";
import {
    Repository, DataSource, LessThanOrEqual,
    MoreThanOrEqual, Between
} from 'typeorm';
import { Redirections } from "./orm/redirections/redirections.entity";
import { DatabaseResponse } from '../../../types/response.types';
import { Requests } from "./orm/requests/requests.entity";
import { LoggerService } from "../utils/logs.service";
import { Codes } from "../auth/orm/codes.entity";
import { Users } from "./orm/users/users.entity";
import { Logs } from "./orm/logs/logs.entity";
import { HttpStatus } from "@nestjs/common";
import { NotFoundError } from "rxjs";

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
            default: throw new Error(`The endpoint "${endpoint}" does not exist.`);
        }
    }

    private recognizeModel = (endpoint: string): Repository<CRUDTypes> => {
        switch (endpoint) {
            case 'logs': return this.logs;
            case 'redirections': return this.redirections;
            case 'requests': return this.requests;
            case 'users': return this.users;
            case 'codes': return this.codes;
            default: throw new Error(`The entity for "${endpoint}" does not exist.`);
        }
    }

    public getMultipleElements = async ({ endpoint, conditions }: getMultipleElementsProps): Promise<DatabaseResponse> => {

        const { minDate, maxDate, maxCount, offset = 0 } = conditions;
        const startTime = Date.now();

        try {
            let response: CRUDTypes;

            if (maxDate || minDate) {
                const entity = this.getEntity(endpoint);

                if (!entity) throw new Error(`The entity for "${endpoint}" does not exist.`);

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

                if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

                response = await model.find();
            }

            if (maxCount) {
                response = response.filter((_, i, arr) => i >= arr.length - 1 - offset - (maxCount - 1) && i <= arr.length - 1 - offset);
            }

            return {
                status: HttpStatus.FOUND,
                content: response,
                message: await this.logger.received({
                    label: `${response.length} ${response.length > 1 ? "elements were found." : "element was found."}`,
                    description: `Endpoint: "${endpoint}", maxCount: "${maxCount}", offset: "${offset}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Failed to retrieve elements from: "${endpoint}".`,
                    description: `Failed to retrieve elements from: "${endpoint}", maxCount: "${maxCount}", offset: "${offset}". Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }

    public getSingleElementById = async ({ endpoint, id }: getSingleElementByIdProps): Promise<DatabaseResponse> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

        try {

            const response = await model.findOneBy({ id });

            if (!response) {
                throw new NotFoundError(`Item with id: "${id}" not found`);
            }

            return {
                status: HttpStatus.FOUND,
                content: response,
                message: await this.logger.received({
                    label: `Single element was found.`,
                    description: `Endpoint: "${endpoint}", ID: "${id}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            }

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Failed to retrieve element with ID: "${id}" from "${endpoint}".`,
                    description: `Failed to retrieve element with ID: "${id}", from "${endpoint}". Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }

    public getMultipleElementsByParam = async ({ endpoint, param, value, conditions }: getMultipleElementsByParamProps): Promise<DatabaseResponse> => {

        const { minDate, maxDate, maxCount, offset = 0 } = conditions;
        const startTime = Date.now();

        try {
            let response: CRUDTypes[];
            let query = {};

            if (maxDate || minDate) {

                const entity = this.getEntity(endpoint);
                if (!entity) throw new Error(`The entity for "${endpoint}" does not exist.`);

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
                if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

                query[param] = value;
                response = await model.findBy(query);
            }

            if (maxCount) {
                response = response.filter((_, i, arr) => i >= arr.length - 1 - offset - (maxCount - 1) && i <= arr.length - 1 - offset);
            }

            return {
                status: HttpStatus.FOUND,
                content: response,
                message: await this.logger.received({
                    label: `${response.length} items were found.`,
                    description: `Search on "${endpoint}", query: "{${param}:${value}}", maxCount: "${maxCount}", offset: "${offset}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Failed to retrieve elements with {${param}:${value}} from "${endpoint}".`,
                    description: `Failed to retrieve multiple elements by "{${param}:${value}}" 
                        from "${endpoint}", maxCount: "${maxCount}", offset: "${offset}". Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }

    public createSingleElement = async ({ endpoint, data }: createSingleElementProps): Promise<DatabaseResponse> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

        try {

            if (endpoint === 'redirections') {
                const redirection = await model.findOneBy({ route: data.route });

                if (redirection) {
                    throw new ConflictException(`The redirection already exists.`);
                }
            }

            const response = await model.save({
                ...data,
                jstimestamp: Date.now(),
            });

            return {
                status: HttpStatus.CREATED,
                content: response,
                message: await this.logger.created({
                    label: `A single item was created.`,
                    description: `Endpoint: "${endpoint}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Failed to create a single element on "${endpoint}".`,
                    description: `Failed to create a single element on "${endpoint}". Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }

    public createMultipleElements = async ({ endpoint, dataArray }: createMultipleElementsProps): Promise<DatabaseResponse> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

        try {

            const response = [];
            for (let item of dataArray) {

                if (endpoint === 'redirections') {
                    const redirection = await model.findOneBy({ route: item.route });

                    if (redirection) {
                        const err = new Error(`A redirection with this route already exists.`)
                        this.logger.fail({
                            label: `Failed to create one of the multiple redirections.`,
                            description: `Failed to create ${dataArray.length} elements on "${endpoint}", 
                                data: "${JSON.stringify(item)}". Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
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

            return {
                status: HttpStatus.CREATED,
                content: response,
                message: await this.logger.created({
                    label: `${dataArray.length} elements successfully created.`,
                    description: `Endpoint: "${endpoint}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Failed to create ${dataArray.length} elements on "${endpoint}".`,
                    description: `Failed to create ${dataArray.length} elements on "${endpoint}". Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                })
            }
        }
    }

    public updateSingleElement = async ({ endpoint, id, data }: updateSingleElementProps): Promise<DatabaseResponse> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

        try {

            const instance = await model.findOneBy({ id });

            if (!instance) {
                throw new NotFoundException(`The item with id: "${id}" not found.`);
            }

            const response = await model.save({ ...instance, ...data });

            return {
                status: HttpStatus.OK,
                content: response,
                message: await this.logger.updated({
                    label: `Item with ID: ${id} has been updated.`,
                    description: `Endpoint: "${endpoint}", element ID: "${id}", new data: "${JSON.stringify(data)}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Error while updating a single element.`,
                    description: `Failed to update the single element with ID: "${id}" on "${endpoint}". 
                        Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }

    public patchSingleElement = async ({ endpoint, id, data }: patchSingleElementProps): Promise<DatabaseResponse> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

        try {

            const instance = await model.findOneBy({ id });

            if (!instance) {
                throw new NotFoundException(`The item with id: "${id}" not found.`);
            }

            const response = await model.save({ ...instance, ...data });

            return {
                status: HttpStatus.OK,
                content: response,
                message: await this.logger.updated({
                    label: `Item with ID: "${id}" has been patched.`,
                    description: `Endpoint: "${endpoint}", ID: "${id}", new data: "${JSON.stringify(data)}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Error while patching a single element.`,
                    description: `Failed to patch the single element with ID: "${id}" on "${endpoint}". 
                        Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }

    public patchMultipleElementsByParam = async ({ endpoint, param, value, data }: patchMultipleElementsByParamProps): Promise<DatabaseResponse> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

        try {
            const response = [];
            const query = {};
            query[param] = value;
            const instances = await model.findBy(query);
            for (let instance of instances) {
                const item = await model.save({ ...instance, ...data });
                response.push(item);
            }

            return {
                status: HttpStatus.OK,
                content: response,
                message: await this.logger.updated({
                    label: `${response.length} items have been patched.`,
                    description: `Endpoint: "${endpoint}", items: ${response.length}, query: "{${param}:${value}}". 
                        New data: "${JSON.stringify(data)}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Error while patching multiple elements.`,
                    description: `Failed to patch ${data.length} elements found by: "{${param}:${value}}" on "${endpoint}". 
                        Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }

    public deleteSingleElementById = async ({ endpoint, id }: deleteSingleElementByIdProps): Promise<DatabaseResponse> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

        try {

            const instance = await model.findOneBy({ id });

            if (!instance) {
                throw new NotFoundException(`The item with id: "${id}" not found.`);
            }

            const status = await model.delete({ id });
            const response = { ...status, raw: { ...instance } };

            return {
                status: HttpStatus.OK,
                content: response,
                message: await this.logger.deleted({
                    label: `Item with ID: "${id}" has been deleted.`,
                    description: `Endpoint: "${endpoint}", item: "${JSON.stringify(response)}", 
                        ID: "${id}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Error while deleting a single element.`,
                    description: `Failed to delete the single element with ID: "${id}" on "${endpoint}". 
                        Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }

    public deleteMultipleElementsByParam = async ({ endpoint, param, value }: deleteMultipleElementsByParamProps): Promise<DatabaseResponse> => {

        const startTime = Date.now();
        const model = this.recognizeModel(endpoint);

        if (!model) throw new Error(`The model for "${endpoint}" does not exist.`);

        try {

            const query = {};
            query[param] = value;

            const item = await model.findBy(query);
            const status = await model.delete(query);
            const response = { ...status, raw: [...item] };

            return {
                status: HttpStatus.OK,
                content: response,
                message: await this.logger.deleted({
                    label: `${response?.raw?.length} items have been deleted.`,
                    description: `Endpoint: "${endpoint}", items: "${JSON.stringify(response)}", 
                        query: "{${param}:${value}}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime,
                })
            };

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Error while deleting multiple elements.`,
                    description: `Failed to delete multiple elements found by: "{${param}:${value}}" on "${endpoint}". 
                        Error: "${err}", Time: "${new Date().toLocaleString('pl-PL')}".`,
                    startTime, err,
                }),
            }
        }
    }
}