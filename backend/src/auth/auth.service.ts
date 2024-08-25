import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUser, LoginUserResponse, logoutUser, RegisterUser, RegisterUserResponse, RemoveUserProps } from './auth.types';
import { JwtService } from '@nestjs/jwt';

export type User = any;

@Injectable()

export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
    ) {

    }

    private readonly users = [
        {
            userId: 1,
            username: 'john',
            password: 'changeme',
        },
        {
            userId: 2,
            username: 'maria',
            password: 'guess',
        },
    ];

    private async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }

    async registerUser({ login, password, confirmPassword }: RegisterUser): Promise<RegisterUserResponse> {
        return
    }

    async loginUser({ login, password }: LoginUser): Promise<LoginUserResponse> {
        console.log(login, password)
        const user = await this.findOne(login);
        if (user?.password !== password) {
            throw new UnauthorizedException();
        }
        const { ...result } = user;

        const payload = { sub: user.userId, username: user.username };
        return {
            accessToken: await this.jwtService.signAsync(payload),
            refreshToken: '',
        }
    }

    async logoutUser({ login, accessToken }: logoutUser): Promise<any> {
        return
    }

    async removeUser({ login, password, accessToken }: RemoveUserProps): Promise<any> {
        return
    }

}