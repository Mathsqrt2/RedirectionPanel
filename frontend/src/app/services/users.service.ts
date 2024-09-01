import { Injectable } from "@angular/core";
import { Permissions } from "./auth.service";
import { HttpClient } from "@angular/common/http";

@Injectable()

export class UsersService {

    private currentUser: User;
    private users: User[] = [];

    private fetchData = async () => {
        await this.getUsersList();
    }

    private getUsersList = async () => {
        return new Promise(resolve => {
            
            resolve(true)// temporary
        })
    }

    constructor(

    ) {
        this.fetchData();
    }

    getCurrentUserToken(): string {
        return this.currentUser.accessToken;
    }

    getCurrentUserName = (): string => {
        return this.currentUser.username;
    }

    getCurrentUserPermissions = () => {
        return this.currentUser.permissions;
    }

    getCurrentUserId(): number {
        return this.currentUser.userId;
    }

    registerUser(newUser: User) {
        this.currentUser = newUser;
    }
}

export type User = {
    username: string,
    permissions: Permissions,
    accessToken?: string,
    userId: number,
}