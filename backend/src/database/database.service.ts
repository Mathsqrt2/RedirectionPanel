import { Inject, Injectable } from "@nestjs/common";
import { Repository } from 'typeorm';
import { SHA256 } from 'crypto-js'
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class DatabaseService {

    constructor(
        @Inject('USERS') private readonly user: Repository<any>
    ){}

}