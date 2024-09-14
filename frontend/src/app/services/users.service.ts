import { Injectable } from "@angular/core";
import { Permissions } from "./auth.service";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, first } from "rxjs";

@Injectable()

export class UsersService {

    private domain: string = `http://localhost:3000`;
    private targetUrl: string = `${this.domain}/api`;
    private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>({} as User);
    private users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

    public deleteEmailProcess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    public changeEmailProcess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    constructor(
        private readonly http: HttpClient,
    ) {
        this.currentUser
            .pipe(first())
            .subscribe(
                (newValue: User) => {
                    if (!this.users.getValue() && newValue.userId && newValue.permissions.canManage) {
                        this.getUsersList();
                    }
                })
    }

    public getUsersList = async (): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.get(`${this.targetUrl}/users`, { withCredentials: true }).pipe(first())
                    .subscribe(
                        (response: UsersResponse) => {
                            this.users.next(response.content);
                            resolve(true);
                        }
                    )
            } catch (err) {
                resolve(false)
            }
        })
    }

    public updateUsersList = async (): Promise<boolean> => {
        return new Promise(async (resolve) => {
            try {
                await this.getUsersList();
                resolve(true);
            } catch (err) {
                resolve(false);
            }
        })
    }

    public updateCurrentUser = async (): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                const currentUser = this.currentUser.getValue();
                this.http.get(`${this.targetUrl}/auth/currentuser/${currentUser.userId}`,
                    { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        ({ status, content }: { status: number, content?: User }) => {
                            if (status === 200) {
                                this.currentUser.next({ ...currentUser, ...content });
                                localStorage.accessToken = JSON.stringify(this.currentUser.getValue());
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }
                    );
            } catch (err) {
                resolve(false);
            }
        })
    }

    public restoreCurrentUserData(newUser: User) {
        this.currentUser.next(newUser);
    }

    public getCurrentUser = (): BehaviorSubject<User> => {
        return this.currentUser;
    }

    public setCurrentUserPermissions = async (permissions: Permissions): Promise<boolean> => {
        return new Promise(resolve => {
            try {
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
            } catch (err) {
                resolve(false);
            }
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

    private deleteCookie = (name: string, path: string = "/"): void => {
        document.cookie = `${decodeURIComponent(name)}=;path=${path}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    }

    public deactivateCurrentUser = async (body: { login: string, password: string }): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                const user = this.currentUser.getValue();
                this.http.patch(`${this.targetUrl}/auth/deactivate/user/${user.userId}`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(({ status }: { status: number }) => {
                        if (status === 202) {
                            const users = this.users.getValue();
                            this.users.next({ ...users.filter((user: User) => user.userId !== user.userId) });
                            this.deleteCookie('jwt');
                            localStorage.removeItem('accessToken');
                            resolve(true);
                        } else {
                            resolve(false)
                        }
                    })
            } catch (err) {
                resolve(false);
            }
        })
    }

    public sendVerificationEmail = async (body: { userId: number, email: string }): Promise<boolean> => {
        return new Promise(async resolve => {
            try {
                this.http.post(`${this.targetUrl}/auth/getverificationemail`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: { status: number, message: string }) => {
                            if (response.status === 200) {
                                this.http.patch(`${this.targetUrl}/auth/update/email/${body.userId}`,
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

    public updateEmailValue = async (values: { newEmail?: string, emailSent: boolean }): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                const body: Body = { emailSent: values.emailSent };
                this.http.patch(`${this.targetUrl}/auth/update/email/${this.currentUser.getValue().userId}`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        ((response: { status: number, message: string }) => {
                            if (response.status === 200) {
                                console.log('zadzialo sie true')
                                this.currentUser.next({ ...this.currentUser.getValue(), email: body?.newEmail || null, emailSent: values.emailSent });
                                this.updateCurrentUser();
                                resolve(true);
                            } else {
                                console.log('zadzial sie elese');
                                resolve(false);
                            }
                        })
                    )
            } catch (err) {
                console.log('zadzial sie erro')
                resolve(false);
            }
        })
    }

    public removeEmailValue = async (body: { password: string }): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.patch(`${this.targetUrl}/auth/remove/email/${this.currentUser.getValue().userId}`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: { status: number, message?: string }) => {
                            if (response.status === 202) {
                                this.currentUser.next({ ...this.currentUser.getValue(), email: null, emailSent: null });
                                this.updateCurrentUser();
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
            } catch (err) {
                resolve(false);
            }
        })
    }

    public checkIfActiveCodeExists = async (): Promise<Code> => {
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
                                    resolve(code);
                                } else {
                                    resolve(null);
                                }
                            }
                        }
                    )
            } catch (err) {
                resolve(null);
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

type Body = {
    emailSent: boolean,
    newEmail?: string,
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

export type CodeResponse = {
    status: number,
    content: Code,
}

export type Code = {
    id: number,
    userId: number,
    status: boolean,
    expireDate: number,
    email: string,
}