import { HttpStatus } from "@nestjs/common";
import { LogsDto } from "./orm/logs/logs.dto";
import { RedirectionsDto } from "./orm/redirections/redirections.dto";
import { RequestsDto } from "./orm/requests/requests.dto";
import { SecretsDto } from "./orm/secrets/secrets.dto";
import { UsersDto } from "./orm/users/users.dto";

type ErrorResponse = {
    status: HttpStatus,
    message: string;
}

export type CRUDBody = LogsDto | RedirectionsDto | RequestsDto | SecretsDto | UsersDto;

export type DatabaseOutput = ErrorResponse | any;

export type CRUDResponse = ErrorResponse | DatabaseOutput;

export type getMultipleElementsProps = {
    endpoint: string,
    maxCount: number,
    offset: number,
}

export type getSingleElementByIdProps = {
    endpoint: string,
    id: number,
}

export type getMultipleElementsByParamProps = {
    endpoint: string,
    param: string,
    value: string | number,
    maxCount?: number,
    offset?: number,
}

export type createMultipleElementsProps = {
    endpoint: string,
    dataArray: CRUDBody[],
}

export type createSingleElementProps = {
    endpoint: string,
    data: CRUDBody,
}

export type updateSingleElementProps = {
    endpoint: string,
    id: number,
    data: CRUDBody,
}

export type patchSingleElementProps = {
    endpoint: string,
    id: number,
    data: CRUDBody,
}

export type patchMultipleElementsByParamProps = {
    endpoint: string,
    param: string,
    value: string | number,
    data: CRUDBody,
}

export type deleteSingleElementByIdProps = {
    endpoint: string,
    id: number,
}

export type deleteMultipleElementsByParamProps = {
    endpoint: string,
    param: string,
    value: string | number,
}