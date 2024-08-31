import { Injectable } from "@angular/core";
import { Permissions } from "./auth.service";
import { HttpClient } from "@angular/common/http";

@Injectable()

export class UsersService {

    private userId: number;
    private accessToken: string;
    private username: string;
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


    getCurrentUserToken(): string {
        return this.accessToken;
    }

    getCurrentUserId(): number {
        return this.userId;
    }

    registerUser({ username, permissions, accessToken, userId }: RegisterUser) {
        this.username = username;
        this.permissions = permissions;
        this.accessToken = accessToken;
        this.userId = userId;
    }
}

type RegisterUser = {
    username: string,
    permissions: Permissions,
    accessToken?: string,
    userId: number,
}