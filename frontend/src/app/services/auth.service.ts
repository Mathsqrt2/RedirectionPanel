import { RegisterProps } from "../../../../types/property.types";
import { LoginResponse, RegisterUserResponse } from "../../../../types/response.types";
import { HttpClient } from "@angular/common/http";
import { UsersService } from "./users.service";
import { Injectable } from "@angular/core";
import { first } from "rxjs/operators";

@Injectable()

export class AuthService {

    private domain: string = `http://localhost:3000`;
    private api: string = `${this.domain}/api`;
    private isLoggedIn: Boolean = false;
    private accessToken: string | null = null;

    constructor(
        private readonly http: HttpClient,
        private readonly usersService: UsersService,
    ) {

        if (localStorage.getItem(`accessToken`)) {
            const read = JSON.parse(localStorage.getItem(`accessToken`));
            if (Date.now() > read.expireDate) {
                localStorage.removeItem(`accessToken`);
            } else {
                this.usersService.restoreCurrentUserData({
                    login: read.login,
                    permissions: read.permissions,
                    accessToken: read.accessToken,
                    id: read.id,
                });
                this.usersService.updateCurrentUser();
                this.setStatus(read.accessToken);
                const expireDate = Date.now() + (1000 * 60 * 60 * 24 * 7);
                localStorage.accessToken = JSON.stringify({ ...read, expireDate });
            }
        }
    }

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
                this.http.post(`${this.api}/auth/signin`, loginForm)
                    .pipe(first())
                    .subscribe(
                        (response: LoginResponse) => {
                            this.setStatus(response?.accessToken);

                            if (response?.accessToken) {
                                const expireDate = Date.now() + (1000 * 60 * 60 * 24 * 7)
                                localStorage.accessToken = JSON.stringify({ ...response, expireDate });

                                this.setCookie("jwt", `${JSON.stringify({ accessToken: response.accessToken })}`, 10);
                                this.usersService.restoreCurrentUserData({
                                    login: response.login,
                                    permissions: response.permissions,
                                    accessToken: response.accessToken,
                                    id: response.userId,
                                    email: response.email,
                                    emailSent: response.emailSent,
                                });
                                this.usersService.updateCurrentUser();
                                resolve(true)
                            }

                            resolve(false);
                        },

                    )
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
            this.http.post(`${this.api}/auth/signup`, body)
                .pipe(first())
                .subscribe({
                    next: (response: RegisterUserResponse) => {
                        if (response.status === 200) {
                            this.setStatus(response?.accessToken);

                            const expireDate = Date.now() + (1000 * 60 * 60 * 24 * 7)
                            localStorage.accessToken = JSON.stringify({ ...response, expireDate });

                            this.setCookie("jwt", `${JSON.stringify({ accessToken: response.accessToken })}`, 10);
                            this.usersService.restoreCurrentUserData({
                                login: response.login,
                                permissions: response.permissions,
                                accessToken: response.accessToken,
                                id: response.userId,
                            });
                            this.usersService.updateCurrentUser();

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