import { Injectable } from "@angular/core";

@Injectable()

export class LogsService {


    counter: 0;
    private domain = `http://localhost:3000`;
    private baseUrl = `${this.domain}/api/logs`;

    constructor() { }

}