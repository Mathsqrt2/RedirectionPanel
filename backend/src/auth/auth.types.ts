import { HttpStatus } from "@nestjs/common"
import { Request } from "express";

export type RegisterUser = {
    login: string,
    password: string,
    confirmPassword: string,
    req?: Request,
}

export type RegisterUserResponse = {
    status: HttpStatus.ACCEPTED | HttpStatus.OK,
    accessToken: string,
    login: string,
    permissions: Permissions,
    email?: string,
    userId?: number,
} | ErrorResponse;

type ErrorResponse = {
    status: HttpStatus.CONFLICT | HttpStatus.BAD_REQUEST | HttpStatus.INTERNAL_SERVER_ERROR | HttpStatus.UNAUTHORIZED,
    message?: string;
}

export type LoginUser = {
    login: string,
    password: string,
    req?: Request,
}

type Permissions = {
    canDelete: boolean,
    canUpdate: boolean,
    canCreate: boolean,
    canManage: boolean,
}

export type LoginUserResponse = {
    status: HttpStatus.OK | HttpStatus.UNAUTHORIZED | HttpStatus.INTERNAL_SERVER_ERROR,
    accessToken: string,
    login: string,
    userId: number,
    email?: string,
    permissions: Permissions
} | ErrorResponse;

export type logoutUser = {
    login: string,
    accessToken: string,
}

export type logoutUserResponse = {
    status: HttpStatus.ACCEPTED | HttpStatus.UNAUTHORIZED,
} | ErrorResponse;

export type RemoveUserProps = {
    login: string,
    password: string,
}

export type RemoveUserResponse = {
    status: HttpStatus.ACCEPTED | HttpStatus.UNAUTHORIZED,
} | ErrorResponse;

export type SendVerificationCodeResponse = {
    status: HttpStatus.OK | HttpStatus.BAD_REQUEST | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
}

export type VerifyEmailResponse = {
    status: HttpStatus.OK | HttpStatus.BAD_REQUEST | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    content?: {
        permissions: Permissions,
        login: string,
        userId: number,
    },
}

export type UpdatePswdResponse = {
    status: HttpStatus.OK | HttpStatus.UNAUTHORIZED | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
}

export type updatePermissionsResponse = {
    status: HttpStatus.OK | HttpStatus.UNAUTHORIZED | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
}

export type updateStatusResponse = {
    status: HttpStatus.OK | HttpStatus.UNAUTHORIZED | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
}

export type responseWithCode = {
    status: HttpStatus.OK | HttpStatus.UNAUTHORIZED | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    content?: Code,
}

type Code = {
    id: number,
    code: string,
    userId: number,
    status: boolean,
    expireDate: number,
    email: string,
}

export type currentUserResponse = {
    status: HttpStatus.OK | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    content?: User,
}

export type User = {
    username: string,
    permissions: Permissions,
    userId: number,
    email?: string,
    emailSent?: boolean,
}


export type transportDataType = {
    service: string,
    host: string,
    port: string,
    secure: boolean,
    auth: smtpAuth,
}

export type smtpAuth = {
    user: string,
    pass: string,
}