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
                    if (newValue.permissions.canManage) {
                        this.getUsersList()
                    }
                }
            })
    }

    public updateCurrentUser = async () => {
        this.http.get(`${this.targetUrl}/users/${this.currentUser.getValue().userId}`, { withCredentials: true }).subscribe(
            (newState: UserResponse) => {
                const currentUser = this.currentUser.getValue();
                const user: User = {
                    username: newState.login,
                    accessToken: currentUser.accessToken,
                    permissions: {
                        canCreate: newState.canCreate,
                        canDelete: newState.canDelete,
                        canUpdate: newState.canUpdate,
                        canManage: newState.canManage,

                    },
                    userId: newState.id,
                    email: newState.email,
                }
                this.currentUser.next(user);
            }
        );
    }

    public getCurrentUser = (): BehaviorSubject<User> => {
        return this.currentUser;
    }

    public getCurrentUserToken = (): string => {
        return this.currentUser.getValue().accessToken;
    }

    public getCurrentUserName = (): string => {
        return this.currentUser.getValue().username;
    }

    public getCurrentUserPermissions = () => {
        return this.currentUser.getValue().permissions;
    }

    public getCurrentUserId = (): number => {
        return this.currentUser.getValue().userId;
    }

    public getCurrentUserEmail = (): string => {
        return this.currentUser.getValue().email;
    }

    public setCurrentUserEmail = (email: string): void => {
        const user = this.currentUser.getValue();
        this.currentUser.next({ ...user, email });
    }

    public setCurrentUserPermissions = (permissions: Permissions): void => {
        const user = this.currentUser.getValue();
        this.currentUser.next({ ...user, permissions });
    }

    public registerUser(newUser: User) {
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

type UserResponse = {
    login: string,
    id: number,
    email?: string,
    canCreate: boolean,
    canDelete: boolean,
    canManage: boolean,
    canUpdate: boolean,
}