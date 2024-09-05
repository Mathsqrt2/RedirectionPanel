import {
    CanActivate, ExecutionContext,
    Inject,
    Injectable, UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import config from "src/config";
import { Logs } from "src/database/orm/logs/logs.entity";
import { Users } from "src/database/orm/users/users.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        @Inject(`LOGS`) private logs: Repository<Logs>,
        @Inject(`USERS`) private users: Repository<Users>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const startTime = Date.now();
        const user = { id: null, username: null };
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
            const payload = await this.jwtService.verifyAsync(token, { secret: config.secret });

            if (!payload) {
                throw new UnauthorizedException();
            }

            if (Date.now() > (payload?.exp * 1000)) {
                throw new UnauthorizedException(`Token has expired`);
            }

            user.id = payload.sub;
            user.username = payload.username;
            request['user'] = payload;

            const userPermissions = await this.users.findOneBy({ id: user.id });
            const method = request.route.methods;

            if (method?.post && !userPermissions.canCreate) {
                throw new UnauthorizedException(`Couldn't create. Insufficient permissions`);
            }

            else if (method?.delete && !userPermissions.canDelete) {
                throw new UnauthorizedException(`Couldn't delete. Insufficient permissions`);
            }

            else if ((method?.patch || method.put) && !userPermissions.canUpdate) {
                throw new UnauthorizedException(`Couldn't update. insufficient permissions`);
            }

            if (request.params.endpoint === 'users' && !userPermissions.canManage) {
                throw new UnauthorizedException(`Couldn't manage users. Insufficient permissions`);
            }

        } catch (err) {
            console.log(err);
            await this.logs.save({
                label: `Failed to authorize in service.`,
                description: `User: "${user.username}" with id: "${user.id}". Request: "${JSON.stringify(request.route.methods)}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                status: "failed",
                jstimestamp: Date.now(),
                duration: Math.floor(Date.now() - startTime),
            })
            throw new UnauthorizedException();
        }

        await this.logs.save({
            label: `Authorized in service.`,
            description: `User: "${user.username}", with id: "${user.id}". Request: "${JSON.stringify(request.route.methods)}", Time: ${new Date().toLocaleString('pl-PL')}`,
            status: "success",
            jstimestamp: Date.now(),
            duration: Math.floor(Date.now() - startTime),
        })

        return true;
    }
}