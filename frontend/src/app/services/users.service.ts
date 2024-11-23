import {
    CurrentUserResponse, DefaultResponse, ResponseWithCode,
    UpdateUserResponse, UsersResponse,
    VerifyEmailResponse
} from "../../../../types/response.types";
import {
    User, ChangePasswordProps,
    NewUserBody, UpdateUserBody, Permissions,
    UpdateEmailProps
} from "../../../../types/property.types";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, first, firstValueFrom } from "rxjs";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable()

export class UsersService {

    private domain: string = `http://localhost:3000`;
    private api: string = `${this.domain}/api`;
    private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>({} as User);
    public users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

    public deleteEmailProcess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public changeEmailProcess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public pendingEmail: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
    ) {
        this.currentUser
            .pipe(first())
            .subscribe(
                async (newValue: User) => {
                    if (!this.users.getValue() && newValue.id && newValue.permissions.canManage) {
                        await this.updateUsersList();
                    }
                })
    }

    public updateUsersList = async (): Promise<boolean> => {

        const url: string = `${this.api}/users`;
        let response: UsersResponse;

        try {
            response = await firstValueFrom(this.http.get<UsersResponse>(url, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 302) {
            return false;
        }

        this.users.next(response.content);
        return true;

    }

    public updateCurrentUser = async (): Promise<boolean> => {

        const currentUser = this.currentUser.getValue();
        const url: string = `${this.api}/user/${currentUser.id}`;
        let response: CurrentUserResponse;

        try {
            response = await firstValueFrom(this.http.get<CurrentUserResponse>(url, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        this.currentUser.next({ ...currentUser, ...response.content });
        localStorage.accessToken = JSON.stringify(this.currentUser.getValue());
        return true;

    }

    public restoreCurrentUserData(newUser: User) {
        this.currentUser.next(newUser);
    }

    public getCurrentUser = (): BehaviorSubject<User> => {
        return this.currentUser;
    }

    public getUserImage = async (): Promise<Blob> => {

        const url: string = `${this.api}/user/avatar/${this.currentUser.getValue().id}`;

        try {
            return firstValueFrom(this.http.get(url, { withCredentials: true, responseType: `blob` }).pipe(first()));
        } catch (err) {
            return null;
        }

    }

    public setUserPermissions = async (permissions: Permissions, id?: number): Promise<boolean> => {

        const url: string = `${this.api}/user/permissions`;
        const body = { ...permissions, userId: id || this.currentUser.getValue().id };
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(this.http.patch<DefaultResponse>(url, body, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        const user = this.currentUser.getValue();

        if (!id || id === user.id) {
            this.currentUser.next({ ...user, permissions });

            const accessToken = localStorage.getItem(`accessToken`);
            if (accessToken) {
                const data = JSON.parse(accessToken);
                localStorage.accessToken = JSON.stringify({ ...data, permissions });
            }

        } else {
            await this.updateUsersList();
        }

        return true;
    }

    public changeUserPassword = async (body: ChangePasswordProps): Promise<boolean> => {

        const url: string = `${this.api}/user/password`;
        let response: DefaultResponse;
        const payload = { ...body, userId: this.currentUser.getValue().id };
        try {
            response = await firstValueFrom(
                this.http.patch<DefaultResponse>(url, payload, { withCredentials: true }).pipe(first())
            );
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        return true;
    }

    public deactivateUser = async (body: { login?: string, password?: string, id?: number }): Promise<boolean> => {

        const user = this.currentUser.getValue();
        const url: string = `${this.api}/user/${body.id ? body.id : user.id}`;
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(this.http.put<DefaultResponse>(url, body, { withCredentials: true }).pipe(first()));
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        const users = this.users.getValue();
        if (!body.id) {
            this.users.next([...users.filter((user_: User) => user_.id !== user.id)]);
            this.router.navigate(['/login']);
        } else {
            this.users.next([...users.filter((user_: User) => user_.id !== body.id)]);
        }

        return true;
    }

    private setEmailStatus = async ({ id, status }: { id: number, status: boolean }): Promise<boolean> => {

        const url: string = `${this.api}/user/status/${id}`;
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(
                this.http.patch<DefaultResponse>(url, { emailSent: status }, { withCredentials: true }).pipe(first())
            );
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        this.updateCurrentUser();
        return true;
    }

    public sendVerificationEmail = async (body: { id: number, email: string }): Promise<boolean> => {

        const url: string = `${this.api}/code`;
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(
                this.http.post<DefaultResponse>(url, body, { withCredentials: true }).pipe(first())
            );
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        await this.setEmailStatus({ id: body.id, status: true });
        await this.updateCurrentUser();
        return true;
    }

    public updateEmailValue = async (values: UpdateEmailProps): Promise<boolean> => {

        const url: string = `${this.api}/user/status/${this.currentUser.getValue().id}`;
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(
                this.http.patch<DefaultResponse>(url, values, { withCredentials: true }).pipe(first())
            )
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        this.currentUser.next({ ...this.currentUser.getValue(), email: values?.newEmail || null, emailSent: values.emailSent });
        await this.updateCurrentUser();
        return true;
    }

    public removeEmailValue = async (body: { password: string }): Promise<boolean> => {

        const url: string = `${this.api}/user/email/${this.currentUser.getValue().id}`;
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(
                this.http.patch<DefaultResponse>(url, body, { withCredentials: true }).pipe(first())
            )
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        this.currentUser.next({ ...this.currentUser.getValue(), email: null, emailSent: null });
        await this.updateCurrentUser();
        return true;
    }

    public checkIfActiveCodeExists = async (): Promise<boolean> => {

        const url: string = `${this.api}/code/user/${this.currentUser.getValue().id}`;
        let response: ResponseWithCode;

        try {
            response = await firstValueFrom(
                this.http.get<ResponseWithCode>(url, { withCredentials: true }).pipe(first())
            )
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        const code = response.content;
        if (Date.now() > code.expireDate) {
            return false;
        }

        this.pendingEmail.next(code.email);
        return true;
    }

    public verifyByRequest = async (code: number): Promise<boolean> => {

        const url: string = `${this.api}/code/${code}`;
        let response: VerifyEmailResponse;

        try {
            response = await firstValueFrom(
                this.http.get<VerifyEmailResponse>(url, { withCredentials: true }).pipe(first())
            )
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        await this.updateCurrentUser();
        return true;
    }

    public createUserInPanel = async (body: NewUserBody): Promise<boolean> => {

        const url: string = `${this.api}/auth/create`;
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(
                this.http.post<DefaultResponse>(url, body, { withCredentials: true }).pipe(first())
            );
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        await this.updateUsersList();
        return true;
    }

    public updateWholeUser = async (body: UpdateUserBody): Promise<boolean> => {

        const url: string = `${this.api}/user/${body.id}`;
        let response: UpdateUserResponse;

        try {
            response = await firstValueFrom(
                this.http.patch<UpdateUserResponse>(url, body, { withCredentials: true }).pipe(first())
            )
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        await this.updateUsersList();
        return true;
    }

    public setAvatar = async (image: File): Promise<boolean> => {

        const body = new FormData();
        body.append('image', image, image.name);

        const url: string = `${this.api}/user/avatar/${this.currentUser.getValue().id}`;
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(
                this.http.post<DefaultResponse>(url, body, { withCredentials: true }).pipe(first())
            )
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        return true;
    }

    public deleteAvatar = async (): Promise<boolean> => {

        const url: string = `${this.api}/user/avatar/${this.currentUser.getValue().id}`;
        let response: DefaultResponse;

        try {
            response = await firstValueFrom(
                this.http.delete<DefaultResponse>(url, { withCredentials: true }).pipe(first())
            )
        } catch (err) {
            return false;
        }

        if (response.status !== 200) {
            return false;
        }

        return true;
    }
}