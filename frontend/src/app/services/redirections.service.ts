import { HttpClient } from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { UsersService } from "./users.service";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable()

export class RedirectionsService implements OnInit {

    baseUrl: string = `http://localhost:3000/api`;
    public redirections = new BehaviorSubject<Redirection[]>([]);
    constructor(
        private http: HttpClient,
    ) {

        this.http.get(`${this.baseUrl}/redirections`, { withCredentials: true }).subscribe(
            (response: RedirectionsResponse) => {
                this.redirections.next(response.content);
            })
    }

    ngOnInit(): void {
        console.log
    }

    deleteRedirection(index: number) {
        this.http.delete(`${this.baseUrl}/redirections/${index}`, { withCredentials: true }).subscribe(() => {
            this.redirections.next([...this.redirections.getValue().filter(redirection => redirection.id !== index)]);
        });
    }

    editRedirection(index: number) {

    }

    createRedirection(body: Redirection) {
        this.http.post(`${this.baseUrl}/redirections`, body, { withCredentials: true }).subscribe(
            (response: { status: number, content: Redirection }) => {
                this.redirections.next([...this.redirections.getValue(), response.content])
            });
    }

    getRedirections(): any {
        return this.redirections;
    }
}

type RedirectionsResponse = {
    status: number,
    content: Redirection[]
}

export type Redirection = {
    id?: number,
    targetUrl: string,
    route: string,
    userId: number,
}