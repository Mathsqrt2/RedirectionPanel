import { Body, Controller, Delete, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserResponse, logoutUserResponse, RegisterUserResponse, RemoveUserResponse } from './auth.types';
import { LogoutUserDto } from './dtos/logoutUser.dto';
import { RemoveUserDto } from './dtos/removeUser.dto';

@Controller(`api/auth`)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
    ) { }

    @Post(`register`)
    async registerUser(
        @Body() body: RegisterUserDto,
    ): Promise<RegisterUserResponse> {
        try {
            return await this.authService.registerUser(body);
        } catch (err) {
            console.log(err);
        }
    }

    @Post(`login`)
    async loginUser(
        @Body() body: LoginUserDto,
    ): Promise<LoginUserResponse> {
        try {
            return await this.authService.loginUser(body);
        } catch (err) {
            console.log(err);
        }
    }

    @Post(`logout`)
    async logoutUser(
        @Body() body: LogoutUserDto,
    ): Promise<logoutUserResponse> {
        try {
            return await this.authService.logoutUser(body);
        } catch (err) {
            console.log(err);
        }
    }

    @Delete(`remove`)
    async removeUser(
        @Body() body: RemoveUserDto,
    ): Promise<RemoveUserResponse> {
        try {
            return await this.authService.removeUser(body);
        } catch (err) {
            console.log(err);
        }
    }

}