import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UsersService } from "./users.service";
import { Router } from "@angular/router";
import { RegisterUserResponse } from "../../../../backend/src/auth/auth.types";
import { first } from "rxjs/operators";

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
                this.usersService.restoreCurrentUserData({
                    username: response.login,
                    permissions: response.permissions,
                    accessToken: response.accessToken,
                    userId: response.userId,
                });
                this.setStatus(response.accessToken);
                const expireDate = Date.now() + (1000 * 60 * 60 * 24 * 7);
                localStorage.accessToken = JSON.stringify({ ...response, expireDate });
                this.router.navigate(['/admin/profile'])
            }
        }
    }

    private domain: string = `http://localhost:3000`;
    private baseUrl: string = `${this.domain}/api`;
    private isLoggedIn: Boolean = false;
    private accessToken: string | null = null;

    private setCookie = (name: string, value: string | number, expirationDays: number, path: string = "/"): void => {
        const date: Date = new Date((Date.now() + (1000 * 60 * 60 * 24 * expirationDays)));
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};path=${path};expires=${date.toUTCString()}`;
    }

    private deleteCookie = (name: string, path: string = "/"): void => {
        document.cookie = `${decodeURIComponent(name)}=;path=${path}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    }

    private setStatus = (token?: string): void => {
        if (token) {
            this.accessToken = token;
            this.isLoggedIn = true;
        } else {
            this.accessToken = null;
            this.isLoggedIn = false;
        }
    }

    public isAuthenticated = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (this.isLoggedIn) {
                resolve(true);
            }
            resolve(false);
        })
    }

    public login = async (loginForm: { userLogin: string, userPassword: string }): Promise<boolean> => {

        return new Promise((resolve) => {
            if (!this.accessToken) {
                this.http.post(`${this.baseUrl}/auth/login`, loginForm)
                    .pipe(first())
                    .subscribe({
                        next: (response: LoginResponse) => {
                            this.setStatus(response?.accessToken);

                            if (response?.accessToken) {
                                const expireDate = Date.now() + (1000 * 60 * 60 * 24 * 7)
                                localStorage.accessToken = JSON.stringify({ ...response, expireDate });

                                this.setCookie("jwt", `${JSON.stringify({ accessToken: response.accessToken })}`, 10);
                                this.usersService.restoreCurrentUserData({
                                    username: response.login,
                                    permissions: response.permissions,
                                    accessToken: response.accessToken,
                                    userId: response.userId,
                                    email: response.email,
                                    emailSent: response.emailSent,
                                });
                                resolve(true)
                            }

                            resolve(false);
                        },

                        error: () => {
                            resolve(false);
                        },
                    })
            } else {
                resolve(true);
            }
        })

    }

    public logout = (): void => {
        this.setStatus();
        this.deleteCookie("jwt");
        localStorage.removeItem('accessToken');
    }

    public registerNewUser = async (body: RegisterProps): Promise<boolean> => {
        return new Promise((resolve) => {
            this.http.post(`${this.baseUrl}/auth/register`, body)
                .pipe(first())
                .subscribe({
                    next: (response: RegisterUserResponse) => {
                        if (response.status === 202) {
                            this.setStatus(response?.accessToken);

                            const expireDate = Date.now() + (1000 * 60 * 60 * 24 * 7)
                            localStorage.accessToken = JSON.stringify({ ...response, expireDate });

                            this.setCookie("jwt", `${JSON.stringify({ accessToken: response.accessToken })}`, 10);
                            this.usersService.restoreCurrentUserData({
                                username: response.login,
                                permissions: response.permissions,
                                accessToken: response.accessToken,
                                userId: response.userId,
                            });

                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    },
                    error: () => {
                        resolve(false);
                    }
                });
        })
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
    userId: number,
    email?: string,
    emailSent?: boolean,
    accessToken?: string,
}

type RegisterProps = {
    login: string,
    password: string,
    confirmPassword: string,
}