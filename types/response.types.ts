import { Code, Log, Redirection, RequestData, User, Permissions } from "./property.types";

export type CodeResponse = {
    status: number,
    content: Code,
}

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

export type UserFromResponse = User & {
    canCreate: boolean,
    canUpdate: boolean,
    canDelete: boolean,
    canManage: boolean,
}

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