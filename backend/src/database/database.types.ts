import { HttpStatus } from "@nestjs/common";
import { Logs } from "./orm/logs/logs.entity";
import { Redirections } from "./orm/redirections/redirections.entity";
import { Requests } from "./orm/requests/requests.entity";
import { Secrets } from "./orm/secrets/secrets.entity";
import { Users } from "./orm/users/users.entity";
import { LogsDto } from "./orm/logs/logs.dto";
import { RedirectionsDto } from "./orm/redirections/redirections.dto";
import { RequestsDto } from "./orm/requests/requests.dto";
import { SecretsDto } from "./orm/secrets/secrets.dto";
import { UsersDto } from "./orm/users/users.dto";

type ErrorResponse = {
    status: HttpStatus,
    message: string;
}

export type DTOs = LogsDto | RedirectionsDto | RequestsDto | SecretsDto | UsersDto;
export type CRUDTypes = Logs | Redirections | Requests | Secrets | Users | any;
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
    dataArray: CRUDTypes[],
}

export type createSingleElementProps = {
    endpoint: string,
    data: CRUDTypes,
}

export type updateSingleElementProps = {
    endpoint: string,
    id: number,
    data: CRUDTypes,
}

export type patchSingleElementProps = {
    endpoint: string,
    id: number,
    data: CRUDTypes,
}

export type patchMultipleElementsByParamProps = {
    endpoint: string,
    param: string,
    value: string | number,
    data: CRUDTypes,
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