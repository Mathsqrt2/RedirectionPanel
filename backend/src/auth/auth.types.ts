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

export type LogoutUser = {
    login: string,
    accessToken: string,
}

export type LogoutUserResponse = {
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

export type UpdatePermissionsResponse = {
    status: HttpStatus.OK | HttpStatus.UNAUTHORIZED | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
}

export type UpdateStatusResponse = {
    status: HttpStatus.OK | HttpStatus.UNAUTHORIZED | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
}

export type ResponseWithCode = {
    status: HttpStatus.OK | HttpStatus.UNAUTHORIZED | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    content?: CodeWithoutDetails,
}

type CodeWithoutDetails = {
    id: number,
    userId: number,
    status: boolean,
    expireDate: number,
    email: string,
}

export type CurrentUserResponse = {
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


export type TransportDataType = {
    service: string,
    host: string,
    port: string,
    secure: boolean,
    auth: SmtpAuth,
}

export type SmtpAuth = {
    user: string,
    pass: string,
}

export type SimpleResponse = {
    status: HttpStatus.OK | HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
}