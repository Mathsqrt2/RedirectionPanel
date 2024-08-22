import { Injectable } from '@nestjs/common';
import { LoginUser, LoginUserResponse, logoutUser, RegisterUser, RegisterUserResponse, RemoveUserProps } from './auth.types';

@Injectable()

export class AuthService {

    async registerUser({ login, password, confirmPassword }: RegisterUser): Promise<RegisterUserResponse> {
        return
    }

    async loginUser({ login, password }: LoginUser): Promise<LoginUserResponse> {
        return
    }

    async logoutUser({ login, accessToken }: logoutUser): Promise<any> {
        return
    }

    async removeUser({ login, password, accessToken }: RemoveUserProps): Promise<any> {
        return
    }

}