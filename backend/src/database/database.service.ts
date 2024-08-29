import { Inject, Injectable } from "@nestjs/common";
import { Repository } from 'typeorm';
import { SHA256 } from 'crypto-js'
import { HttpStatus } from "@nestjs/common";
import { createSingleElementProps, createMultipleElementsProps, DatabaseOutput, getSingleElementByIdProps, getMultipleElementsByParamProps, getMultipleElementsProps, deleteMultipleElementsByParamProps, deleteSingleElementByIdProps, patchMultipleElementsByParamProps, patchSingleElementProps, updateSingleElementProps } from "./database.types";

@Injectable()
export class DatabaseService {

    constructor(
        @Inject('USERS') private readonly user: Repository<any>
    ) { }

    private recognizeModel = (endpoint: string) => {
        return
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
        return
    }

    updateSingleElement = async ({ endpoint, id, data }: updateSingleElementProps): Promise<DatabaseOutput> => {

    }

    patchSingleElement = async ({ endpoint, id, data }: patchSingleElementProps): Promise<DatabaseOutput> => {

    }

    patchMultipleElementsByParam = async ({ endpoint, param, value, data }: patchMultipleElementsByParamProps): Promise<DatabaseOutput> => {

    }

    deleteSingleElementById = async ({ endpoint, id }: deleteSingleElementByIdProps): Promise<DatabaseOutput> => {

    }

    deleteMultipleElementsByParam = async ({ endpoint, param, value }: deleteMultipleElementsByParamProps): Promise<DatabaseOutput> => {

    }
}