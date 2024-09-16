import { DatabaseResponse, DefaultResponse, RedirectionsResponse, RequestResponse } from "../../../../types/response.types";
import { Redirection, RequestData } from "../../../../types/property.types";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, first } from "rxjs";
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
        return new Promise(resolve => {
            try {
                this.http.get(`${this.baseUrl}/redirections`, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: RedirectionsResponse) => {
                            if (response.status === 302) {
                                this.redirections.next(response.content);
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        });
            } catch (err) {
                resolve(false);
            }
        });
    }

    private fetchRequests = async (): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.get(`${this.baseUrl}/requests`, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: RequestResponse) => {
                            if (response.status === 302) {
                                this.requests.next(response.content);
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        });
            } catch (err) {
                resolve(false);
            }
        });
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
        return new Promise(async resolve => {
            try {
                await this.fetchRedirections();
                await this.fetchRequests();
                this.assignValues();
                this.findCategories(this.redirections.getValue());
                resolve(true);
            } catch (err) {
                resolve(false);
            }
        });
    }

    public getCategories = (): string[] => {
        return this.categories.getValue();
    }

    public deleteRedirection = (index: number): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.delete(`${this.baseUrl}/redirections/${index}`, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        ({ status }: DatabaseResponse) => {
                            if (status === 200) {
                                this.redirections.next([...this.redirections.getValue().filter(redirection => redirection.id !== index)]);
                                this.findCategories(this.redirections.getValue());
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        });
            } catch (err) {
                resolve(false);
            }
        });
    }

    public editRedirection = (redirection: Redirection): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.put(`${this.baseUrl}/redirections/${redirection.id}`, redirection, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: DatabaseResponse) => {
                            if (response.status === 200) {
                                this.redirections.next([...this.redirections.getValue().map(
                                    (r: Redirection) => redirection.id === r.id ? redirection : r)],
                                );
                                this.findCategories(this.redirections.getValue())
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        });
            } catch (err) {
                resolve(false);
            }
        });
    }

    public createRedirection = (body: Redirection): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.post(`${this.baseUrl}/redirections`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: DatabaseResponse) => {
                            if (response.status === 201) {
                                this.redirections.next([...this.redirections.getValue(), response.content])
                                this.findCategories(this.redirections.getValue());
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        });
            } catch (err) {
                resolve(false);
            }
        });
    }
}