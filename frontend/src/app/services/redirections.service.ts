import { DatabaseResponse, DefaultResponse, RedirectionsResponse, RequestResponse } from "../../../types/response.types";
import { Redirection, RequestData } from "../../../types/property.types";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, first, firstValueFrom } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()

export class RedirectionsService {

    public redirections: BehaviorSubject<Redirection[]> = new BehaviorSubject<Redirection[]>([]);
    public requests: BehaviorSubject<RequestData[]> = new BehaviorSubject<RequestData[]>([]);
    public categories: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    public domain: string = `http://localhost:3000`;
    private baseUrl: string = `${this.domain}/api`;

    constructor(
        private http: HttpClient,
    ) {
        this.fetchData();
    }

    private fetchRedirections = async (): Promise<boolean> => {

        const url = `${this.baseUrl}/redirections`;
        let response: RedirectionsResponse;
        try {
            response = await firstValueFrom(this.http.get<RedirectionsResponse>(url, { withCredentials: true }));
        } catch (err) {
            return false;
        }

        if (response.status !== 302) {
            return false;
        }

        this.redirections.next(response.content);
        return true;

    }

    private fetchRequests = async (): Promise<boolean> => {

        const url: string = `${this.baseUrl}/requests`;
        let response: RequestResponse;

        try {
            response = await firstValueFrom(this.http.get<RequestResponse>(url, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 302) {
            return false;
        }
        this.requests.next(response.content);
        return true;

    }

    private assignValues = (): void => {
        const localRedsirections = this.redirections.getValue();
        const localRequests = this.requests.getValue();

        for (let redirection of localRedsirections) {
            let clicksTotal = 0;
            for (let request of localRequests) {
                if (request.redirectionId === redirection.id) {
                    clicksTotal++;
                }
            }
            redirection.clicksTotal = clicksTotal;
        }
    }

    private findCategories = (redirections: Redirection[]): void => {
        const newCategories = ['all'];
        for (let redirection of redirections) {
            if (!newCategories.includes(redirection.category)) {
                newCategories.push(redirection.category);
            }
        }
        this.categories.next(newCategories);
    }

    private fetchData = async (): Promise<boolean> => {

        if (await this.fetchRedirections() && await this.fetchRequests()) {
            this.assignValues();
            this.findCategories(this.redirections.getValue());
            return true;
        }

        return false;
    }

    public getCategories = (): string[] => {
        return this.categories.getValue();
    }

    public deleteRedirection = async (index: number): Promise<boolean> => {

        const url: string = "";
        let response: DatabaseResponse;

        try {
            response = await firstValueFrom(this.http.delete<DatabaseResponse>(url, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        this.redirections.next([...this.redirections.getValue().filter(redirection => redirection.id !== index)]);
        this.findCategories(this.redirections.getValue());
        return true;

    }

    public editRedirection = async (redirection: Redirection): Promise<boolean> => {

        const url: string = `${this.baseUrl}/redirections/${redirection.id}`;
        let response: DatabaseResponse;

        try {
            response = await firstValueFrom(this.http.put<DatabaseResponse>(url, redirection, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        this.redirections.next([...this.redirections.getValue().map(
            (r: Redirection) => redirection.id === r.id ? redirection : r)],
        );
        this.findCategories(this.redirections.getValue());
        return true;

    }

    public createRedirection = async (body: Redirection): Promise<boolean> => {

        const url: string = `${this.baseUrl}/redirections`;
        let response: DatabaseResponse;

        try {
            response = await firstValueFrom(this.http.post<DatabaseResponse>(url, body, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 201) {
            return false;
        }

        this.redirections.next([...this.redirections.getValue(), response.content])
        this.findCategories(this.redirections.getValue());
        return true;

    }
}