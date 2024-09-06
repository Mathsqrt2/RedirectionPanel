import { Injectable } from "@angular/core";
import { Permissions } from "./auth.service";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";

@Injectable()

export class UsersService {

    private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>({} as User);
    private users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
    private hasBeenDataFetched: boolean = false;
    private domain: string = `http://localhost:3000`;
    private targetUrl: string = `${this.domain}/api`;

    private getUsersList = async () => {
        return new Promise(resolve => {
            this.http.get(`${this.targetUrl}/users`, { withCredentials: true }).subscribe(
                (response: UsersResponse) => {
                    this.users.next(response.content);
                }
            )
            resolve(true)
        })
    }

    constructor(
        private readonly http: HttpClient,
    ) {
        this.currentUser.subscribe(
            (newValue: User) => {
                if (!this.hasBeenDataFetched && newValue.userId) {
                    this.hasBeenDataFetched = true;
                    if(newValue.permissions.canManage){
                        this.getUsersList()
                    }
                }
            })
    }

    getCurrentUser = (): BehaviorSubject<User> => {
        return this.currentUser;
    }

    getCurrentUserToken = (): string => {
        return this.currentUser.getValue().accessToken;
    }

    getCurrentUserName = (): string => {
        return this.currentUser.getValue().username;
    }

    getCurrentUserPermissions = () => {
        return this.currentUser.getValue().permissions;
    }

    getCurrentUserId = (): number => {
        return this.currentUser.getValue().userId;
    }

    getCurrentUserEmail = (): string => {
        return this.currentUser.getValue().email;
    }

    setCurrentUserEmail = (email: string): void => {
        const user = this.currentUser.getValue();
        this.currentUser.next({ ...user, email });
    }

    setCurrentUserPermissions = (permissions: Permissions): void => {
        const user = this.currentUser.getValue();
        this.currentUser.next({ ...user, permissions });
    }

    registerUser(newUser: User) {
        this.currentUser.next(newUser);
    }
}

type UsersResponse = {
    status: number,
    content: User[],
}

export type User = {
    username: string,
    permissions: Permissions,
    accessToken?: string,
    userId: number,
    email?: string,
}