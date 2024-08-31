import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UsersService } from "./users.service";

@Injectable()

export class RedirectionsService {

    baseUrl: string = `http://localhost:3000/api`;
    redirections: any[] = [];

    constructor(
        private http: HttpClient,
        private usersService: UsersService,
    ) {

        this.http.get(`${this.baseUrl}/redirections`, { withCredentials: true }).subscribe({
            next: (response) => {
                console.log(`next`, response);
            },
            error: (response) => {
                console.log(`error`, response);
            },
        })
    }

    getRedirections(): any {
        return this.redirections;
    }
}