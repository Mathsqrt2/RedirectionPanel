import { DTOs, QueryConditions, DatabaseResponse } from '@libs/types';
import {
    Controller, Post, Param, Body, Get, UseGuards,
    Query, Put, Patch, Delete, HttpStatus,
} from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { StrictAuthGuard } from "../auth/auth.guard";
import { FindMultipleElementsDto } from '@libs/dtos';

@Controller(`api`)
export class DatabaseController {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    @UseGuards(StrictAuthGuard)
    @Get(`/:endpoint`)
    async findMultipleElements(
        @Param(`endpoint`) endpoint: string,
        @Query() { maxCount, offset, minDate, maxDate }: FindMultipleElementsDto,
    ): Promise<DatabaseResponse> {
        try {

            const conditions: QueryConditions = { maxCount, offset, minDate, maxDate }
            return await this.database.findMultipleElements({ endpoint, conditions });

        } catch (err) {

            console.log(`findMultipleElements error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve multiple elements from: "${endpoint}".`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Get(`/:endpoint/:id`)
    async findSingleElementById(
        @Param(`endpoint`) endpoint: string,
        @Param(`id`) id: number,
    ): Promise<DatabaseResponse> {
        try {
            return await this.database.findSingleElementById({ endpoint, id })
        } catch (err) {
            console.log(`findElementById error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve element from: "${endpoint}", with ID: "${id}".`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Get(`/:endpoint/:param/:value`)
    async findMultipleElementsByParam(
        @Param(`endpoint`) endpoint: string,
        @Param(`param`) param: string,
        @Param(`value`) value: string | number,
        @Query(`maxCount`) maxCount?: number,
        @Query(`offset`) offset?: number,
        @Query(`minDate`) minDate?: string,
        @Query(`maxDate`) maxDate?: string,
    ): Promise<DatabaseResponse> {
        try {
            const conditions: QueryConditions = { maxCount, offset, minDate, maxDate }
            return await this.database.findMultipleElementsByParam({ endpoint, param, value, conditions });
        } catch (err) {
            console.log(`findMultipleElementsByParam error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve multiple elements from: "${endpoint}", by "{${param}:${value}}".`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Post(`/:endpoint`)
    async createSingleElement(
        @Param(`endpoint`) endpoint: string,
        @Body() data: DTOs,
    ): Promise<DatabaseResponse> {
        try {
            return await this.database.createSingleElement({ endpoint, data });
        } catch (err) {
            console.log(`createSingleElement error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to create element on: "${endpoint}", with values: ${JSON.stringify(data)}.`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Post(`multiple/:endpoint`)
    async createMultipleElements(
        @Param(`endpoint`) endpoint: string,
        @Body() dataArray: DTOs[],
    ): Promise<DatabaseResponse> {
        try {
            return await this.database.createMultipleElements({ endpoint, dataArray });
        } catch (err) {
            console.log(`createMultipleElements error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to create multiple elements on: "${endpoint}", with values: ${JSON.stringify(dataArray)}.`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Put(`/:endpoint/:id`)
    async updateSingleElement(
        @Param(`endpoint`) endpoint: string,
        @Param(`id`) id: number,
        @Body() data: DTOs,
    ): Promise<DatabaseResponse> {
        try {
            return await this.database.updateSingleElement({ endpoint, id, data });
        } catch (err) {
            console.log(`updateSingleElement error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update element with id: "${id}". On: "${endpoint}", with values: ${JSON.stringify(data)}.`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Patch(`/:endpoint/:id`)
    async patchSingleElementById(
        @Param(`endpoint`) endpoint: string,
        @Param(`id`) id: number,
        @Body() data: DTOs,
    ): Promise<DatabaseResponse> {
        try {
            return await this.database.patchSingleElement({ endpoint, id, data });
        } catch (err) {
            console.log(`patchSingleElementById error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to patch element with id: "${id}". On: "${endpoint}", with values: ${JSON.stringify(data)}.`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Patch(`/:endpoint/:param/:value`)
    async patchMultipleElementsByParam(
        @Param(`endpoint`) endpoint: string,
        @Param(`param`) param: string,
        @Param(`value`) value: string | number,
        @Body() data: DTOs,
    ): Promise<DatabaseResponse> {
        try {
            return await this.database.patchMultipleElementsByParam({ endpoint, param, value, data });
        } catch (err) {
            console.log(`patchMultipleElementsByParam error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to patch multiple elements on "${endpoint}", By "{${param}:${value}}", with values: ${JSON.stringify(data)}.`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Delete(`/:endpoint/:id`)
    async deleteSingleElementById(
        @Param(`endpoint`) endpoint: string,
        @Param(`id`) id: number,
    ): Promise<DatabaseResponse> {
        try {
            return await this.database.deleteSingleElementById({ endpoint, id });
        } catch (err) {
            console.log(`deleteSingleElementById error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to delete element on: "${endpoint}", with ID: "${id}".`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Delete(`/:endpoint/:param/:value`)
    async deleteMultipleElementsByParam(
        @Param(`endpoint`) endpoint: string,
        @Param(`param`) param: string,
        @Param(`value`) value: string,
    ): Promise<DatabaseResponse> {
        try {
            return await this.database.deleteMultipleElementsByParam({ endpoint, param, value });
        } catch (err) {
            console.log(`deleteMultipleElementsByParam error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to delete multiple elements on: "${endpoint}", with "{${param}:${value}}".`,
            }
        }
    }
}