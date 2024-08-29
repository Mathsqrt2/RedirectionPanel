import { Controller, Post, Param, Body, Get, Query, Put, Patch, Delete, HttpStatus } from "@nestjs/common";
import { DatabaseService } from "./database.service";

@Controller(`api`)
export class DatabaseController {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    @Get(`/:endpoint`)
    async getCRUDMultipleElements(

    ) {

    }

}