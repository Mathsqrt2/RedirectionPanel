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

