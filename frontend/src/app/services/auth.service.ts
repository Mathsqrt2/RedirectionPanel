import { LoginResponse, RegisterUserResponse } from "../../../types/response.types";
import { RegisterProps } from "../../../types/property.types";
import { HttpClient } from "@angular/common/http";
import { UsersService } from "./users.service";
import { Injectable } from "@angular/core";
import { first } from "rxjs/operators";
import { firstValueFrom } from "rxjs";

@Injectable()

export class AuthService {

    private domain: string = `http://localhost:3000`;
    private api: string = `${this.domain}/api`;
    private isLoggedIn: boolean = false;
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
        return this.isLoggedIn;
    }

    public login = async (loginForm: { userLogin: string, userPassword: string }): Promise<boolean> => {

        if (this.accessToken) {
            return true;
        }

        const url = `${this.api}/auth/signin`;
        let response: LoginResponse;

        try {
            response = await firstValueFrom(this.http.post<LoginResponse>(url, loginForm).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        if (!response.accessToken) {
            return false;
        }

        this.setStatus(response?.accessToken);

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

        await this.usersService.updateCurrentUser();
        return true;

    }

    public logout = (): void => {
        this.setStatus();
        this.deleteCookie("jwt");
        localStorage.removeItem('accessToken');
    }

    public registerNewUser = async (body: RegisterProps): Promise<boolean> => {

        const url = `${this.api}/auth/signup`;
        let response: RegisterUserResponse;

        try {
            response = await firstValueFrom(this.http.post<RegisterUserResponse>(url, body).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

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

        return true;
    }
}