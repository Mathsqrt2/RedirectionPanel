import {
    CanActivate, ExecutionContext, Inject,
    Injectable, UnauthorizedException
} from "@nestjs/common";
import { LoggerService } from "../utils/logs.service";
import { Users } from "../database/entities";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";

@Injectable()
export class SoftAuthGuard implements CanActivate {
    constructor(
        @Inject(`USERS`) private users: Repository<Users>,
        private jwtService: JwtService,
        private logger: LoggerService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const startTime = Date.now();
        let user: any = { id: null, username: null };
        const request = context.switchToHttp().getRequest();

        let cookie = request.cookies[`jwt`];
        if (typeof cookie === 'string') {
            cookie = JSON.parse(cookie);
        }
        const token = cookie?.accessToken;

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: process.env.SECRET });

            if (!payload) {
                throw new UnauthorizedException(`Invalid token.`);
            }

            if (Date.now() > (payload?.exp * 1000)) {
                throw new UnauthorizedException(`Token expired.`);
            }

            user = await this.users.findOneBy({ id: payload.sub });
            user.username = payload.username;

        } catch (err) {

            await this.logger.fail({
                label: `Authorization failed in the service.`,
                description: `User: "${user.username}" with ID: "${user.id}". 
                    Request: "${JSON.stringify(request.route.methods)}". 
                    Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                startTime, err
            })

            throw new UnauthorizedException(err);
        }

        await this.logger.authorized({
            label: `Successfully authorized in the service.`,
            description: `User: "${user.username}" with ID: "${user.id}". 
                Request: "${JSON.stringify(request.route.methods)}". 
                Time: ${new Date().toLocaleString('pl-PL')}.`,
            startTime,
        })

        return true;
    }
}

export class StrictAuthGuard implements CanActivate {
    constructor(
        @Inject(`USERS`) private users: Repository<Users>,
        private jwtService: JwtService,
        private logger: LoggerService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const startTime = Date.now();
        const request = context.switchToHttp().getRequest();
        let user: any = { id: null, username: null };

        let cookie = request.cookies[`jwt`];
        if (typeof cookie === 'string') {
            cookie = JSON.parse(cookie);
        }
        const token = cookie?.accessToken;

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: process.env.SECRET });

            if (!payload) {
                throw new UnauthorizedException(`Invalid token.`);
            }

            if (Date.now() > (payload?.exp * 1000)) {
                throw new UnauthorizedException(`Token expired.`);
            }

            request['user'] = payload;

            user = await this.users.findOneBy({ id: payload.sub });
            user.username = payload.username;
            const method = request.route.methods;

            if (method?.post && !user.canCreate) {
                throw new UnauthorizedException(`Creation failed. Insufficient permissions.`);
            }

            else if (method?.delete && !user.canDelete) {
                throw new UnauthorizedException(`Deletion failed. Insufficient permissions.`);
            }

            else if ((method?.patch || method.put) && !user.canUpdate) {
                throw new UnauthorizedException(`Update failed. Insufficient permissions.`);
            }

            if (request.params.endpoint === 'users' && !user.canManage && request.params?.id !== user.id) {
                throw new UnauthorizedException(`User management failed. Insufficient permissions.`);
            }


        } catch (err) {

            await this.logger.fail({
                label: `Authorization failed in the service.`,
                description: `User: "${user.username}" with ID: "${user.id}". 
                    Request: "${JSON.stringify(request.route.methods)}". 
                    Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                startTime, err
            })

            throw new UnauthorizedException(err);
        }

        await this.logger.authorized({
            label: `Successfully authorized in the service.`,
            description: `User: "${user.username}" with ID: "${user.id}". 
                Request: "${JSON.stringify(request.route.methods)}". 
                Time: ${new Date().toLocaleString('pl-PL')}.`,
            startTime,
        })

        return true;
    }
}