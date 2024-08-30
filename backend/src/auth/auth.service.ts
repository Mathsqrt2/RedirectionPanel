import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginUser, LoginUserResponse, logoutUser, RegisterUser, RegisterUserResponse, RemoveUserProps } from './auth.types';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Users } from 'src/database/orm/users/users.entity';
import { Secrets } from 'src/database/orm/secrets/secrets.entity';
import { SHA256 } from 'crypto-js';

@Injectable()

export class AuthService {
    constructor(
        private jwtService: JwtService,
        @Inject(`USERS`) private readonly users: Repository<Users>,
        @Inject(`SECRETS`) private readonly secrets: Repository<Secrets>,
    ) { }

    private assignRequestID = (requestSubject: string): string => {
        return SHA256(`${requestSubject}.${Date.now()}`).toString();
    }

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

    private getKey = async (): Promise<string> => {

        const secret = await this.secrets.findOneBy({ status: 'active' });
        if (!secret) {
            const oneMonth = 1000 * 60 * 60 * 24 * 30;
            const data = {
                decryptionKey: this.assignRequestID((Date.now()).toString()),
                expirationTime: Date.now() + oneMonth,
                status: 'active',
            };

            await this.secrets.save(data);
            return data.decryptionKey;
        }

        if (secret.expirationTime < Date.now()) {
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

        const payload = { sub: newUser.id, username: newUser?.login };

        return {
            status: HttpStatus.ACCEPTED,
            accessToken: await this.jwtService.signAsync(payload),
        };

    }

    loginUser = async ({ login, password }: LoginUser): Promise<LoginUserResponse> => {

        const user = await this.users.findOneBy({ login });

        if (!user) {
            throw new UnauthorizedException(`Login or password incorrect`);
        }

        if (!this.comparePasswords(password, user.password)) {
            throw new UnauthorizedException(`Login or password incorrect`);
        }

        const payload = { sub: user.id, username: user.login };
        return { accessToken: await this.jwtService.signAsync(payload) }
    }

    logoutUser = async ({ login, accessToken }: logoutUser): Promise<any> => {
        return
    }

    removeUser = async ({ login, password }: RemoveUserProps): Promise<any> => {

        const user = await this.users.findOneBy({ login });

        if (!user) {
            throw new NotFoundException(`Login or password incorrect`)
        }

        if (this.comparePasswords(password, user.password)) {
            await this.users.delete({ login, password });
        } else {
            throw new UnauthorizedException(`Access denied.`);
        }

    }

}