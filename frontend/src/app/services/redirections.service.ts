import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UsersService } from "./users.service";

@Injectable()

export class RedirectionsService {

    baseUrl: string = `http://localhost/3000/api`;
    redirections: any[] = [];

    constructor(
        private http: HttpClient,
        private usersService: UsersService,
    ) {

        const reqHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            
        });
        this.http.get(`${this.baseUrl}/redirections`, { headers: reqHeaders }).subscribe({
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