import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()

export class RedirectionsService {

    public redirections = new BehaviorSubject<Redirection[]>([]);
    public requests = new BehaviorSubject<RequestData[]>([]);
    public categories = new BehaviorSubject<string[]>([]);
    public domain: string = `http://localhost:3000`;
    private baseUrl: string = `${this.domain}/api`;

    constructor(
        private http: HttpClient,
    ) {
        this.fetchData();
    }

    private fetchRedirections = async (): Promise<boolean> => {
        return new Promise(resolve => {
            this.http.get(`${this.baseUrl}/redirections`, { withCredentials: true }).subscribe(
                (response: RedirectionsResponse) => {
                    this.redirections.next(response.content);
                    resolve(true)
                })
        })
    }

    private fetchRequests = async (): Promise<boolean> => {
        return new Promise(resolve => {
            this.http.get(`${this.baseUrl}/requests`, { withCredentials: true }).subscribe(
                (response: RequestResponse) => {
                    this.requests.next(response.content);
                    resolve(true);
                })
        })
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

    private fetchData = async (): Promise<void> => {
        await this.fetchRedirections();
        await this.fetchRequests();
        this.assignValues();
        this.findCategories(this.redirections.getValue());
    }

    public getCategories = (): string[] => {
        return this.categories.getValue();
    }

    public deleteRedirection(index: number) {
        this.http.delete(`${this.baseUrl}/redirections/${index}`, { withCredentials: true }).subscribe(() => {
            this.redirections.next([...this.redirections.getValue().filter(redirection => redirection.id !== index)]);
            this.findCategories(this.redirections.getValue());
        });
    }

    public editRedirection(redirection: Redirection) {
        this.http.put(`${this.baseUrl}/redirections/${redirection.id}`, redirection, { withCredentials: true }).subscribe(
            () => {
                this.findCategories(this.redirections.getValue())
            })
    }

    public createRedirection(body: Redirection) {
        this.http.post(`${this.baseUrl}/redirections`, body, { withCredentials: true }).subscribe(
            (response: { status: number, content: Redirection }) => {
                this.redirections.next([...this.redirections.getValue(), response.content])
                this.findCategories(this.redirections.getValue());
            });
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
    category?: string,
    clicksTotal?: number,
    clicks30d?: number,
}

type RequestResponse = {
    status: number,
    content: RequestData[]
}

type RequestData = {
    id: number,
    requestIp: string,
    redirectionId: number,
    requestTime: any,
}