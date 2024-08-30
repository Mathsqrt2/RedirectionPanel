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

        const cookie = request.cookies[`jwt`];
        const token = cookie?.accessToken;
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: config.secret });

            if (Date.now() > (payload?.exp * 1000)) {
                throw new UnauthorizedException(`Token has expired`);
            }

            user.id = payload.sub;
            user.username = payload.username;
            request['user'] = payload;

            const userPermissions = this.users.findOneBy({ id: user.id });

        } catch {
            throw new UnauthorizedException();
        }

        await this.logs.save({
            label: "User has successfully authorized in service.",
            description: `User ${user.username} with id: ${user.id}. Time: ${new Date()}`,
            status: "completed",
            duration: Math.floor(Date.now() - startTime),
        })

        return true;
    }
}