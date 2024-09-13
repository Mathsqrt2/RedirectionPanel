import { Injectable } from "@angular/core";
import { Permissions } from "./auth.service";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, first } from "rxjs";

@Injectable()

export class UsersService {

    private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>({} as User);
    private users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
    private hasBeenDataFetched: boolean = false;
    private domain: string = `http://localhost:3000`;
    private targetUrl: string = `${this.domain}/api`;

    private getUsersList = async () => {
        return new Promise(resolve => {
            this.http.get(`${this.targetUrl}/users`, { withCredentials: true }).pipe(first())
                .subscribe(
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
                if (!this.hasBeenDataFetched && newValue.userId && newValue.permissions.canManage) {
                    this.hasBeenDataFetched = true;
                    this.getUsersList();
                }
            })
    }

    public updateCurrentUser = async () => {
        this.http.get(`${this.targetUrl}/auth/currentuser/${this.currentUser.getValue().userId}`, { withCredentials: true })
            .pipe(first())
            .subscribe(
                (newState: { status: number, content: User }) => {
                    const currentUser = this.currentUser.getValue();
                    this.currentUser.next({ ...currentUser, ...newState.content });
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

    public setCurrentUserPermissions = async (permissions: Permissions): Promise<boolean> => {
        return new Promise(resolve => {
            this.http.patch(`${this.targetUrl}/auth/permissions`, { ...permissions, userId: this.currentUser.getValue().userId }, { withCredentials: true })
                .pipe(first())
                .subscribe(
                    (response: { status: number, message: string }) => {
                        if (response.status === 200) {

                            const user = this.currentUser.getValue();
                            this.currentUser.next({ ...user, permissions });

                            const accessToken = localStorage.getItem(`accessToken`);
                            if (accessToken) {
                                const data = JSON.parse(accessToken);
                                localStorage.accessToken = JSON.stringify({ ...data, permissions });
                            }
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
        })
    }

    public changeCurrentUserPassword = async (body: ChangePasswordProps): Promise<boolean> => {
        return new Promise(resolve => {
            this.http.patch(`${this.targetUrl}/auth/password`, { ...body, userId: this.currentUser.getValue().userId }, { withCredentials: true })
                .pipe(first())
                .subscribe(
                    (response: { status: number, message: string }) => {
                        if (response.status === 200) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
        })
    }

    public registerUser(newUser: User) {
        this.currentUser.next(newUser);
    }
}

type UsersResponse = {
    status: number,
    content: User[],
}

type ChangePasswordProps = {
    password: string,
    newPassword: string,
    confirmPassword: string,
    userId?: number,
}

export type User = {
    username: string,
    permissions: Permissions,
    accessToken?: string,
    userId: number,
    email?: string,
    emailSent?: boolean,
}