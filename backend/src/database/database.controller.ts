import {
    Controller, Post, Param, Body, Get,
    Query, Put, Patch, Delete,
    HttpStatus, UseGuards
} from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { DTOs, CRUDResponse, QueryConditions } from "./database.types";
import { StrictAuthGuard } from "src/auth/auth.guard";

@Controller(`api`)
export class DatabaseController {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    @UseGuards(StrictAuthGuard)
    @Get(`/:endpoint`)
    async getMultipleElements(
        @Param(`endpoint`) endpoint: string,
        @Query(`maxCount`) maxCount?: number,
        @Query(`offset`) offset?: number,
        @Query(`minDate`) minDate?: string,
        @Query(`maxDate`) maxDate?: string,
    ): Promise<CRUDResponse> {
        try {
            const conditions: QueryConditions = { maxCount, offset, minDate, maxDate }
            return await this.database.getMultipleElements({ endpoint, conditions });
        } catch (err) {
            console.log(`getMultipleElements error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve multiple elements from: "${endpoint}".`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Get(`/:endpoint/:id`)
    async getSingleElementById(
        @Param(`endpoint`) endpoint: string,
        @Param(`id`) id: number,
    ): Promise<CRUDResponse> {
        try {
            return await this.database.getSingleElementById({ endpoint, id })
        } catch (err) {
            console.log(`getElementById error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve element from: "${endpoint}", with ID: "${id}".`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Get(`/:endpoint/:param/:value`)
    async getMultipleElementsByParam(
        @Param(`endpoint`) endpoint: string,
        @Param(`param`) param: string,
        @Param(`value`) value: string | number,
        @Query(`maxCount`) maxCount?: number,
        @Query(`offset`) offset?: number,
        @Query(`minDate`) minDate?: string,
        @Query(`maxDate`) maxDate?: string,
    ): Promise<CRUDResponse> {
        try {
            const conditions: QueryConditions = { maxCount, offset, minDate, maxDate }
            return await this.database.getMultipleElementsByParam({ endpoint, param, value, conditions });
        } catch (err) {
            console.log(`getMultipleElementsByParam error: `, err);
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
    ): Promise<CRUDResponse> {
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
    ): Promise<CRUDResponse> {
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
    ) {
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
    ) {
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
    ) {
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
    ) {
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
    ) {
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