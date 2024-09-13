import { Injectable } from "@angular/core";
import { Permissions } from "./auth.service";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, first } from "rxjs";
import { CodeResponse } from "../admin/user-profile/confirm-email/confirm-email.component";

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

    public deleteCurrentUser = async (): Promise<boolean> => {
        return new Promise(resolve => {
            try {

                resolve(true);
            } catch (err) {
                resolve(false);
            }
        })
    }

    public registerUser(newUser: User) {
        this.currentUser.next(newUser);
    }

    public sendVerificationEmail = async (body: { userId: number, email: string }): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.post(`${this.targetUrl}/auth/getverificationemail`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: { status: number, message: string }) => {
                            if (response.status === 200) {
                                this.http.patch(`${this.targetUrl}/auth/emailstatus/${body.userId}`,
                                    { emailSent: true },
                                    { withCredentials: true })
                                    .pipe(first())
                                    .subscribe(({ status }: { status: number }) => {
                                        if (status === 200) {
                                            this.updateCurrentUser();
                                            resolve(true);
                                        } else {
                                            resolve(false);
                                        }
                                    });
                            } else if (response.status === 400) {
                                resolve(false)
                            }
                        })
            } catch (err) {
                resolve(false);
            }

        })
    }

    public updateEmailSentStatus = async (status: boolean): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.patch(`${this.targetUrl}/auth/emailstatus/${this.currentUser.getValue().userId}`,
                    { emailSent: status },
                    { withCredentials: true })
                    .pipe(first())
                    .subscribe(({ status }: { status: number }) => {
                        if (status === 200) {
                            this.updateCurrentUser();
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
            } catch (err) {
                resolve(false);
            }
        })
    }

    public checkIfActiveCodeExists = async (): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.get(`${this.targetUrl}/auth/activecode/${this.currentUser.getValue().userId}`,
                    { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: CodeResponse) => {
                            if (response.status === 200) {
                                const code = response.content;
                                if (Date.now() <= code.expireDate) {
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            }
                        }
                    )
            } catch (err) {
                resolve(false);
            }
        })
    }

    public verifyByRequest = async (code: number): Promise<boolean> => {

        return new Promise(resolve => {
            try {
                this.http.get(`${this.targetUrl}/auth/verifybyrequest/${code}`, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: EmailCheck) => {
                            if (response.status === 200) {
                                this.updateCurrentUser();
                                resolve(true);
                            } else {
                                resolve(false)
                            }
                        });
            } catch (err) {
                resolve(false);
            }
        })
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

type EmailCheck = {
    status: number;
    message?: string;
    content?: {
        permissions: Permissions;
        login: string;
        userId: number;
    };
}