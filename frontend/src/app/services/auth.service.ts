import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { UsersService } from "./users.service";
import { Router } from "@angular/router";

@Injectable()

export class AuthService {

    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
        private usersService: UsersService,
    ) {

        if (localStorage.getItem(`accessToken`)) {
            const response = JSON.parse(localStorage.getItem(`accessToken`));
            if (Date.now() > response.expireDate) {
                localStorage.removeItem(`accessToken`);
            } else {
                this.usersService.registerUser({
                    username: response.login,
                    permissions: response.permissions,
                    accessToken: response.accessToken,
                });
                this.setStatus(response.accessToken);
                const expireDate = Date.now() + (1000 * 60 * 60 * 24 * 7);
                localStorage.accessToken = JSON.stringify({ ...response, expireDate });
                this.router.navigate(['/admin'])
            }
        }
    }

    private baseUrl: string = `http://localhost:3000/api`;
    private isLoggedIn: Boolean = false;
    private accessToken: string | null = null;

    private setCookie = (name, value, expirationDays) => {
        const date: Date = new Date((Date.now() + (1000 * 60 * 60 * 24 * expirationDays)));
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${date.toUTCString()}`;
    }
    private deleteCookie = (name) => {
        document.cookie = `${decodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    }
    private getCookie = (name) => {
        const cookieValue = document.cookie.split('; ')
            .find(row => row.startsWith(`${encodeURIComponent(name)}`))?.split('=')[1];
        return decodeURIComponent(cookieValue) || '';
    }

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

    isAuthenticated = () => {
        return new Promise((resolve) => {
            if (this.isLoggedIn) {
                resolve(true);
            }
            resolve(false);
        })
    }

    login = async (loginForm: { userLogin: string, userPassword: string }): Promise<boolean> => {

        return new Promise((resolve, reject) => {

            if (!this.accessToken) {
                this.http.post(`${this.baseUrl}/auth/login`, loginForm).subscribe({

                    next: (response: LoginResponse) => {
                        this.setStatus(response?.accessToken);

                        if (response.accessToken) {

                            const expireDate = Date.now() + (1000 * 60 * 60 * 24 * 7)
                            localStorage.accessToken = JSON.stringify({ ...response, expireDate });
                            this.setCookie("jwt", `${JSON.stringify({ accessToken: response.accessToken })}`, 10);
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
        this.deleteCookie("jwt");
        localStorage.removeItem('accessToken');
    }
}

export type Permissions = {
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