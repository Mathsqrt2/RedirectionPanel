import { HttpStatus } from "@nestjs/common"

export type RegisterUser = {
    login: string,
    password: string,
    confirmPassword: string,
}

export type RegisterUserResponse = {
    status: HttpStatus.ACCEPTED | HttpStatus.OK,
    accessToken: string,
    refreshToken: string,
} | ErrorResponse;

type ErrorResponse = {
    status: HttpStatus.CONFLICT | HttpStatus.BAD_REQUEST | HttpStatus.INTERNAL_SERVER_ERROR | HttpStatus.UNAUTHORIZED,
    message?: string;
}

export type LoginUser = {
    login: string,
    password: string,
}

export type LoginUserResponse = {
    accessToken: string,
    refreshToken: string,
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
    accessToken: string,
}

export type RemoveUserResponse = {
    status: HttpStatus.ACCEPTED | HttpStatus.UNAUTHORIZED,
} | ErrorResponse;

