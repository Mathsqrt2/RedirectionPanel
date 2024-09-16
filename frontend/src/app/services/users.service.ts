import {
    CurrentUserResponse, DefaultResponse, ResponseWithCode,
    UpdateUserResponse, UsersResponse,
    VerifyEmailResponse
} from "../../../../types/response.types";
import {
    User, ChangePasswordProps, Code,
    NewUserBody, UpdateUserBody, Permissions
} from "../../../../types/property.types";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, first } from "rxjs";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable()

export class UsersService {

    private domain: string = `http://localhost:3000`;
    private api: string = `${this.domain}/api`;
    private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>({} as User);
    public users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

    public deleteEmailProcess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    public changeEmailProcess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
    ) {
        this.currentUser.pipe(first()).subscribe(
            (newValue: User) => {
                if (!this.users.getValue() && newValue.id && newValue.permissions.canManage) {
                    this.getUsersList();
                }
            })
    }

    private getUsersList = async (): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.get(`${this.api}/users`, { withCredentials: true }).pipe(first())
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

                this.http.get(`${this.api}/user/${currentUser.id}`,
                    { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        ({ status, content }: CurrentUserResponse) => {
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

    public setUserPermissions = async (permissions: Permissions, id?: number): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.patch(`${this.api}/user/permissions`, { ...permissions, userId: id || this.currentUser.getValue().id }, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: DefaultResponse) => {
                            if (response.status === 200) {
                                const user = this.currentUser.getValue();
                                if (!id || id === user.id) {
                                    this.currentUser.next({ ...user, permissions });

                                    const accessToken = localStorage.getItem(`accessToken`);
                                    if (accessToken) {
                                        const data = JSON.parse(accessToken);
                                        localStorage.accessToken = JSON.stringify({ ...data, permissions });
                                    }
                                } else {
                                    this.updateUsersList();
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

    public changeUserPassword = async (body: ChangePasswordProps): Promise<boolean> => {
        return new Promise(resolve => {
            this.http.patch(`${this.api}/user/password`, { ...body, userId: this.currentUser.getValue().id }, { withCredentials: true })
                .pipe(first())
                .subscribe(
                    (response: DefaultResponse) => {
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

    public deactivateUser = async (body: { login?: string, password?: string, id?: number }): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                const user = this.currentUser.getValue();
                this.http.put(`${this.api}/user/${body.id ? body.id : user.id}`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(({ status }: DefaultResponse) => {
                        if (status === 200) {
                            const users = this.users.getValue();
                            if (!body.id) {
                                this.deleteCookie('jwt');
                                localStorage.removeItem('accessToken');
                                this.users.next([...users.filter((user_: User) => user_.id !== user.id)]);
                                this.router.navigate(['/login']);
                            } else {
                                this.users.next([...users.filter((user_: User) => user_.id !== body.id)]);
                            }
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

    public sendVerificationEmail = async (body: { id: number, email: string }): Promise<boolean> => {
        return new Promise(async resolve => {
            try {
                this.http.post(`${this.api}/code`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: DefaultResponse) => {
                            if (response.status === 200) {
                                this.http.patch(`${this.api}/user/status/${body.id}`,
                                    { emailSent: true },
                                    { withCredentials: true })
                                    .pipe(first())
                                    .subscribe(async ({ status }: { status: number }) => {
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

    public updateEmailValue = async (values: { newEmail?: string, emailSent: boolean }): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.patch(`${this.api}/auth/update/email/${this.currentUser.getValue().id}`, values, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        ((response: DefaultResponse) => {
                            if (response.status === 200) {
                                this.currentUser.next({ ...this.currentUser.getValue(), email: values?.newEmail || null, emailSent: values.emailSent });
                                this.updateCurrentUser();
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                    )
            } catch (err) {
                resolve(false);
            }
        })
    }

    public removeEmailValue = async (body: { password: string }): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.patch(`${this.api}/user/email/${this.currentUser.getValue().id}`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: DefaultResponse) => {
                            if (response.status === 200) {
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
                this.http.get(`${this.api}/code/user/${this.currentUser.getValue().id}`,
                    { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: ResponseWithCode) => {
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
                this.http.get(`${this.api}/code/${code}`, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        (response: VerifyEmailResponse) => {
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

    public createUserInPanel = async (body: NewUserBody): Promise<boolean> => {
        return new Promise(async resolve => {
            try {
                this.http.post(`${this.api}/auth/create`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(
                        async ({ status }: DefaultResponse) => {
                            console.log(status);
                            if (status === 200) {
                                await this.updateUsersList();
                            } else {
                                resolve(false);
                            }
                        }
                    )
            } catch (err) {
                resolve(false);
            }
        })
    }

    public updateWholeUser = async (body: UpdateUserBody): Promise<boolean> => {
        return new Promise(resolve => {
            try {
                this.http.patch(`${this.api}/user/${body.id}`, body, { withCredentials: true })
                    .pipe(first())
                    .subscribe(async ({ status }: UpdateUserResponse) => {
                        if (status === 200) {
                            await this.updateUsersList();
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
}
