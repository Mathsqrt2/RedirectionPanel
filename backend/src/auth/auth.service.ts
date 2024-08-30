import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginUser, LoginUserResponse, logoutUser, RegisterUser, RegisterUserResponse, RemoveUserProps, RemoveUserResponse } from './auth.types';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Users } from 'src/database/orm/users/users.entity';
import { SHA256 } from 'crypto-js';

@Injectable()

export class AuthService {
    constructor(
        private jwtService: JwtService,
        @Inject(`USERS`) private readonly users: Repository<Users>,
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

        return {
            status: HttpStatus.ACCEPTED,
            accessToken: await this.jwtService.signAsync(payload),
            login: newUser.login,
            permissions: { canDelete, canUpdate, canCreate, canManage }
        };

    }

    loginUser = async ({ login, password }: LoginUser): Promise<LoginUserResponse> => {

        const user = await this.users.findOneBy({ login });
        const { canDelete, canUpdate, canCreate, canManage } = user;
        if (!user) {
            throw new UnauthorizedException(`Login or password incorrect`);
        }

        if (!this.comparePasswords(password, user.password)) {
            throw new UnauthorizedException(`Login or password incorrect`);
        }

        const payload = { sub: user.id, username: user.login };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
            status: HttpStatus.OK,
            accessToken,
            login: user.login,
            permissions: { canDelete, canUpdate, canCreate, canManage }
        };

    }

    removeUser = async ({ login, password }: RemoveUserProps): Promise<RemoveUserResponse> => {

        const user = await this.users.findOneBy({ login });

        if (!user) {
            throw new NotFoundException(`Login or password incorrect`)
        }

        if (this.comparePasswords(password, user.password)) {
            await this.users.delete({ login, password });
        } else {
            throw new UnauthorizedException(`Access denied.`);
        }

        return { status: HttpStatus.ACCEPTED }

    }

}