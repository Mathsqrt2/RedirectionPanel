import {
    CanActivate, ExecutionContext, Inject,
    Injectable, UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import config from "src/config";
import { Users } from "src/database/orm/users/users.entity";
import { LoggerService } from "src/utils/logs.service";
import { Repository } from "typeorm";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(`USERS`) private users: Repository<Users>,
        private jwtService: JwtService,
        private logger: LoggerService,
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
                throw new UnauthorizedException(`Invalid token.`);
            }

            if (Date.now() > (payload?.exp * 1000)) {
                throw new UnauthorizedException(`Token expired.`);
            }

            const route = `${request.route.path}`;
            user.id = payload.sub;
            user.username = payload.username;
            request['user'] = payload;

            const user_ = await this.users.findOneBy({ id: user.id });

            if (!route.startsWith(`/api/auth`)) {

                const method = request.route.methods;

                if (method?.post && !user_.canCreate) {
                    throw new UnauthorizedException(`Creation failed. Insufficient permissions.`);
                }

                else if (method?.delete && !user_.canDelete) {
                    throw new UnauthorizedException(`Deletion failed. Insufficient permissions.`);
                }

                else if ((method?.patch || method.put) && !user_.canUpdate) {
                    throw new UnauthorizedException(`Update failed. Insufficient permissions.`);
                }

                if (request.params.endpoint === 'users' && !user_.canManage && request.params?.id !== user_.id) {
                    throw new UnauthorizedException(`User management failed. Insufficient permissions.`);
                }
            }

        } catch (err) {

            await this.logger.fail({
                label: `Authorization failed in the service.`,
                description: `User: "${user.username}" with ID: "${user.id}". 
                    Request: "${JSON.stringify(request.route.methods)}". 
                    Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                startTime,
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