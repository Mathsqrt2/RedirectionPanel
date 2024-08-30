import { Injectable } from "@angular/core";
import { Permissions } from "./auth.service";
import { HttpClient } from "@angular/common/http";

@Injectable()

export class UsersService {

    private accessToken: string | null = null;
    private username: string | null = null;
    private permissions: Permissions = {
        canDelete: false,
        canUpdate: false,
        canCreate: false,
        canManage: false,
    }

    constructor(
        private http: HttpClient,
    ) {

    }
    getToken(): string {
        return this.accessToken;
    }

    registerUser({ username, permissions, accessToken }: RegisterUser) {
        this.username = username;
        this.permissions = permissions;
        this.accessToken = accessToken;
    }
}

type RegisterUser = {
    username: string,
    permissions: Permissions,
    accessToken?: string,
}