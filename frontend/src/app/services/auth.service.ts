import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()

export class AuthService {

    constructor(
        private readonly http: HttpClient,
    ) { }

    private baseUrl: string = `http://localhost:3000/api`;
    isLoggedIn: Boolean = true;

    private accessToken: string | null = null;
    public authSubject = new Subject<boolean>();

    private setStatus = (token?: string): void => {
        if (token) {
            this.accessToken = token;
            this.isLoggedIn = true;
            this.authSubject.next(true);
        } else {
            this.accessToken = null;
            this.isLoggedIn = false;
            this.authSubject.next(false);
        }
    }

    async isAuthenticated() {
        return new Promise((resolve) => {
            if (localStorage?.accessToken) {
                const token = JSON.parse(localStorage.accessToken);
                resolve(token.userAllowed && (Date.now() <= token.expireDate));
            } else {
                resolve(false);
            }
        }
        )
    }


    login = async (loginForm: { userLogin: string, userPassword: string }): Promise<boolean> => {

        return new Promise((resolve, reject) => {

            if (!this.accessToken) {
                this.http.post(`${this.baseUrl}/auth/login`, loginForm).subscribe({

                    next: (response: LoginResponse) => {
                        this.setStatus(response?.accessToken);

                        if (response.accessToken) {
                            localStorage.setItem('accessToken', response.accessToken);
                            resolve(true)
                        }

                        resolve(false);
                    },

                    error: (response: LoginResponse) => {
                        this.setStatus(response.accessToken);
                        reject(false);
                    },

                })
            }

        })

    }

    logout() {
        this.setStatus();
        localStorage.removeItem('accessToken');
    }
}

type Permissions = {
    canDelete: boolean,
    canUpdate: boolean,
    canCreate: boolean,
    canManage: boolean,
}

type LoginResponse = {
    status: number,
    permissions?: Permissions,
    login?: string,
    accessToken?: string,
}