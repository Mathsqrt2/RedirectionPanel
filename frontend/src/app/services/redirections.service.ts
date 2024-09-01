import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()

export class RedirectionsService {

    public domain: string = `http://localhost:3000`;
    public baseUrl: string = `${this.domain}/api`;
    public redirections = new BehaviorSubject<Redirection[]>([]);
    public requests = new BehaviorSubject<RequestData[]>([]);
    constructor(
        private http: HttpClient,
    ) {
        this.fetchData();
    }

    private getRedirections = async (): Promise<boolean> => {
        return new Promise(resolve => {
            this.http.get(`${this.baseUrl}/redirections`, { withCredentials: true }).subscribe(
                (response: RedirectionsResponse) => {
                    this.redirections.next(response.content);
                    resolve(true)
                })
        })
    }

    private getRequests = async (): Promise<boolean> => {
        return new Promise(resolve => {
            this.http.get(`${this.baseUrl}/requests`, { withCredentials: true }).subscribe(
                (response: RequestResponse) => {
                    this.requests.next(response.content);
                    console.log(response);
                    resolve(true);
                })
        })
    }

    private fetchData = async (): Promise<void> => {
        await this.getRedirections();
        await this.getRequests();
        this.assignValues();
    }

    private assignValues = (): void => {
        const localRedsirections = this.redirections.getValue();
        const localRequests = this.requests.getValue();
        const newRedirections: Redirection[] = [];

        for (let redirection of localRedsirections) {
            let clicks30d = 0;
            let clicksTotal = 0;
            for (let request of localRequests) {
                if(request.redirectionId === redirection.id){
                    clicksTotal++;
                    if(request.requestTime){
                        clicks30d++
                    }
                }
            }
            redirection.clicks30d = clicks30d;
            redirection.clicksTotal = clicksTotal;
            newRedirections.push(redirection);

        }
        console.log(newRedirections);
    }

    deleteRedirection(index: number) {
        this.http.delete(`${this.baseUrl}/redirections/${index}`, { withCredentials: true }).subscribe(() => {
            this.redirections.next([...this.redirections.getValue().filter(redirection => redirection.id !== index)]);
        });
    }

    editRedirection(redirection: Redirection) {
        this.http.put(`${this.baseUrl}/redirections/${redirection.id}`, redirection, { withCredentials: true }).subscribe((resp) => {
            console.log('happened', resp)
        })
    }

    createRedirection(body: Redirection) {
        this.http.post(`${this.baseUrl}/redirections`, body, { withCredentials: true }).subscribe(
            (response: { status: number, content: Redirection }) => {
                this.redirections.next([...this.redirections.getValue(), response.content])
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