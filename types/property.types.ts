export type Permissions = {
    canCreate: boolean,
    canUpdate: boolean,
    canDelete: boolean,
    canManage: boolean,
}

export type Code = {
    id: number,
    userId: number,
    status: boolean,
    expireDate: number,
    email: string,
}

export type User = {
    email?: string,
    emailSent?: boolean,
    id: number,
    login: string,
    password?: string,
    permissions?: Permissions,
    accessToken?: string,
}

export type UpdateUserBody = {
    adminToken: string,
    id: number,
    newLogin?: string,
    newPassword?: string,
    newEmail?: string,
}

export type ChangePasswordProps = {
    password: string,
    newPassword: string,
    confirmPassword: string,
    userId?: number,
}

export type NewUserBody = {
    login: string,
    password: string,
    email?: string,
    canCreate: boolean,
    canUpdate: boolean,
    canDelete: boolean,
    canManage: boolean,
}

export type EmailCheck = {
    status: number;
    message?: string;
    content?: {
        permissions: Permissions;
        login: string;
        userId: number;
    };
}

export type Redirection = {
    id?: number,
    targetUrl: string,
    route: string,
    userId: number,
    category?: string,
    clicksTotal?: number,
    clicks30d?: number,
}

export type RequestData = {
    id: number,
    requestIp: string,
    redirectionId: number,
    requestTime: any,
}

export type Log = {
    id?: number,
    label: string,
    description: string,
    status: string,
    duration: string,
    jstimestamp?: number,
}

export type QueryParams = {
    maxCount?: number,
    offset?: number,
    maxDate?: string,
    minDate?: string,
}

export type RegisterProps = {
    login: string,
    password: string,
    confirmPassword: string,
}

export type Route = {
    title: string,
    route: string,
}