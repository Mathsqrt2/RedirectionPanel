import { HttpStatus } from "../backend/node_modules/@nestjs/common";
import { Log, Redirection, RequestData, User, Permissions, CRUDTypes, CodeWithoutDetails } from "./property.types";

export type RequestResponse = {
    status: number,
    content: RequestData[]
}

export type LoginResponse = {
    status: number,
    permissions: Permissions,
    login?: string,
    userId: number,
    email?: string,
    emailSent?: boolean,
    accessToken?: string,
}

export type UserFromResponse = User & Permissions;

export type UsersResponse = {
    status: number,
    content: User[],
}

export type RedirectionsResponse = {
    status: number,
    content: Redirection[]
}

export type LogResponse = {
    status: number,
    content: Log[],
}

export type DefaultResponse = {
    status: HttpStatus.OK | HttpStatus.INTERNAL_SERVER_ERROR | HttpStatus.BAD_REQUEST | HttpStatus.UNAUTHORIZED,
    message?: string,
}

export type DatabaseResponse = {
    status: HttpStatus.OK | HttpStatus.FOUND | HttpStatus.CREATED | HttpStatus.BAD_REQUEST | HttpStatus.NOT_FOUND | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    content?: CRUDTypes,
};

export type UpdateUserResponse = DefaultResponse & {
    content?: User,
}

export type RegisterUserResponse = DefaultResponse & {
    accessToken?: string,
    login?: string,
    permissions?: Permissions,
    email?: string,
    userId?: number,
}

export type LoginUserResponse = DefaultResponse & {
    accessToken?: string,
    login?: string,
    userId?: number,
    email?: string,
    permissions?: Permissions
};

export type VerifyEmailResponse = DefaultResponse & {
    content?: {
        permissions: Permissions,
        login: string,
        userId: number,
    },
}

export type CurrentUserResponse = DefaultResponse & {
    content?: User,
}

export type ResponseWithCode = DefaultResponse & {
    content?: CodeWithoutDetails,

}
export type AvatarResponse = {
    status: HttpStatus.NOT_FOUND | HttpStatus.CREATED | HttpStatus.BAD_REQUEST | HttpStatus.INTERNAL_SERVER_ERROR | HttpStatus.OK,
    message?: string,
}