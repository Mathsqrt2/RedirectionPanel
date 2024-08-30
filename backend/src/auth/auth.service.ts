import {
    ConflictException, HttpStatus, Inject, Injectable,
    NotFoundException, UnauthorizedException
} from '@nestjs/common';
import {
    LoginUser, LoginUserResponse, RegisterUser,
    RegisterUserResponse, RemoveUserProps, RemoveUserResponse
} from './auth.types';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Users } from 'src/database/orm/users/users.entity';
import { SHA256 } from 'crypto-js';
import { Logs } from 'src/database/orm/logs/logs.entity';

@Injectable()

export class AuthService {
    constructor(
        private jwtService: JwtService,
        @Inject(`USERS`) private readonly users: Repository<Users>,
        @Inject(`LOGS`) private readonly logs: Repository<Logs>,
    ) { }

    private securePassword = (password: string): string => {
        const salt = SHA256(Date.now()).toString();
        return `${salt}$${SHA256(`${password}$${salt}`).toString()}`;
    }

    private comparePasswords = (password: string, saltedHash: string): boolean => {
        const parts = saltedHash.split('$');

        if (SHA256(`${password}$${parts[0]}`).toString() === parts[1]) {
            return true;
        }

        return false
    }

    registerUser = async ({ login, password, confirmPassword }: RegisterUser): Promise<RegisterUserResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ login });

            if (user) {
                throw new ConflictException(`User already exists`);
            }

            if (password !== confirmPassword) {
                throw new ConflictException(`Confirm password mismatch`);
            }

            const newUser = await this.users.save({
                login,
                password: this.securePassword(password),
                canDelete: true,
                canUpdate: true,
                canCreate: false,
                canManage: false,
            })

            const { canDelete, canUpdate, canCreate, canManage } = newUser;
            const payload = { sub: newUser.id, username: newUser?.login };

            await this.logs.save({
                label: `User registered`,
                description: `${login} registered, canManage: ${canManage}, canCreate: ${canCreate}, canUpdate: ${canUpdate}, canDelete: ${canDelete}`,
                status: `success`,
                duration: Math.floor(Date.now() - startTime),
            })

            return {
                status: HttpStatus.ACCEPTED,
                accessToken: await this.jwtService.signAsync(payload),
                login: newUser.login,
                permissions: { canDelete, canUpdate, canCreate, canManage }
            };
        } catch (err) {
            console.log(`registerUser`, err);

            await this.logs.save({
                label: `Error while trying to register user`,
                description: `User couldn't be registered with login: "${login}", ${err}`,
                status: `failed`,
                duration: Math.floor(Date.now() - startTime),
            })
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            }
        }
    }

    loginUser = async ({ login, password }: LoginUser): Promise<LoginUserResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ login });

            if (!user) {
                throw new UnauthorizedException(`Login or password incorrect`);
            }

            if (!this.comparePasswords(password, user.password)) {
                throw new UnauthorizedException(`Login or password incorrect`);
            }

            const payload = { sub: user.id, username: user.login };
            const accessToken = await this.jwtService.signAsync(payload);

            const { canDelete, canUpdate, canCreate, canManage } = user;

            await this.logs.save({
                label: `Signed in`,
                description: `User with login: "${login}" signed in, canManage: ${canManage}, canCreate: ${canCreate}, canUpdate: ${canUpdate}, canDelete: ${canDelete}. ${new Date()}`,
                status: `success`,
                duration: Math.floor(Date.now() - startTime),
            })

            return {
                status: HttpStatus.OK,
                accessToken,
                login: user.login,
                permissions: { canDelete, canUpdate, canCreate, canManage }
            };
        } catch (err) {
            console.log(err);
            await this.logs.save({
                label: `error while trying to sign in`,
                description: `User with login: "${login}" couldn't signed in. ${err}. ${new Date()}`,
                status: `failed`,
                duration: Math.floor(Date.now() - startTime),
            })
            return {
                status: HttpStatus.BAD_REQUEST
            }
        }

    }

    removeUser = async ({ login, password }: RemoveUserProps): Promise<RemoveUserResponse> => {

        const startTime = Date.now();

        try {
            const user = await this.users.findOneBy({ login });

            if (!user) {
                throw new NotFoundException(`Login or password incorrect`)
            }

            if (this.comparePasswords(password, user.password)) {
                await this.users.delete({ login, password });
            } else {
                throw new UnauthorizedException(`Access denied.`);
            }

            await this.logs.save({
                label: `User removed`,
                description: `User with login: "${login}" removed. ${new Date()}`,
                status: `success`,
                duration: Math.floor(Date.now() - startTime),
            })

            return { status: HttpStatus.ACCEPTED }
        } catch (err) {
            console.log(`removeUser`, err);

            await this.logs.save({
                label: `Error while trying to remove user`,
                description: `User with login: "${login}" couldn't be removed. ${err} ${new Date()}`,
                status: `failed`,
                duration: Math.floor(Date.now() - startTime),
            })

            return { status: HttpStatus.INTERNAL_SERVER_ERROR }
        }

    }

}