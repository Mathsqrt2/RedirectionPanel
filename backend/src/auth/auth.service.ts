import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginUser, LoginUserResponse, logoutUser, RegisterUser, RegisterUserResponse, RemoveUserProps } from './auth.types';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Users } from 'src/database/orm/users/users.entity';
import { Secrets } from 'src/database/orm/secrets/secrets.entity';
import { SHA256 } from 'crypto-js';

export type User = any;

@Injectable()

export class AuthService {

    constructor(
        @Inject(`USERS`) private readonly users: Repository<Users>,
        @Inject(`SECRETS`) private readonly secrets: Repository<Secrets>,
        private readonly jwtService: JwtService,
    ) {
    }
    private assignRequestID = (requestSubject: string): string => {
        return SHA256(`${requestSubject}.${Date.now()}`).toString();
    }

    private securePassword = (password: string): string => {
        const salt = SHA256(Date.now()).toString();
        return `${salt}$${SHA256(`${password}$${salt}`).toString()}`;
    }

    private comparePasswords = (password: string, saltedHash: string): boolean => {
        const parts = saltedHash.split('$');
        if (SHA256(`${password}$${parts[0]}`) === parts[1]) {
            return true;
        }
        return false
    }

    private async getKey(): Promise<string> {

        const secret = await this.secrets.findOneBy({ status: 'active' });

        if (secret.expirationTime === Date.now()) {
            await this.secrets.save({ ...secret, status: 'inactive' });

            const oneMonth = 1000 * 60 * 60 * 24 * 30;
            const data = {
                decryptionKey: this.assignRequestID((Date.now()).toString()),
                expirationTime: Date.now() + oneMonth,
                status: 'active',
            };

            await this.secrets.save(data);
            return data.decryptionKey;
        }

        return secret.decryptionKey;
    }

    registerUser = async ({ login, password, confirmPassword }: RegisterUser): Promise<RegisterUserResponse> => {

        const user = await this.users.findOneBy({ login });

        if (user) {
            throw new ConflictException(`User with this login already exist.`);
        }

        if (password !== confirmPassword) {
            throw new ConflictException(`Passwords must match.`);
        }

        const newUser = await this.users.save({
            login,
            password: this.securePassword(password),
            canDelete: true,
            canUpdate: true,
            canCreate: true,
            canManage: true,
            accessToken: '',
            refreshToken: ''
        })

        return {
            status: HttpStatus.ACCEPTED,
            accessToken: newUser.accessToken,
            refreshToken: newUser.refreshToken
        };

    }

    loginUser = async ({ login, password }: LoginUser): Promise<LoginUserResponse> => {

        const user = await this.users.findOneBy({ login });

        if (!user) {
            throw new NotFoundException(`User not found.`);
        }

        if (user?.password !== password) {
            throw new UnauthorizedException(`Access denied.`);
        }

        const { ...result } = user;

        //const payload = { sub: user.userId, username: user.username };
        return {
            accessToken: await this.jwtService.signAsync('payload'),
            refreshToken: '',
        }
    }

    logoutUser = async ({ login, accessToken }: logoutUser): Promise<any> => {
        return
    }

    removeUser = async ({ login, password, accessToken }: RemoveUserProps): Promise<any> => {


        await this.users.delete({ login, password, accessToken });
    }

}