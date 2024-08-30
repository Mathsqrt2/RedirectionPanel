import { BadRequestException, Body, Controller, Delete, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserResponse, logoutUserResponse, RegisterUserResponse, RemoveUserResponse } from './auth.types';
import { LogoutUserDto } from './dtos/logoutUser.dto';
import { RemoveUserDto } from './dtos/removeUser.dto';

@Controller(`api/auth`)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post(`register`)
    async registerUser(
        @Body() body: RegisterUserDto,
    ): Promise<RegisterUserResponse> {
        try {
            return await this.authService.registerUser(body);
        } catch (err) {
            console.log(`registerUser`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't register new user.`,
            }
        }
    }

    @Post(`login`)
    async loginUser(
        @Body() body: LoginUserDto,
    ): Promise<LoginUserResponse | string> {
        try {
            if (!body.login || !body.password) {
                throw new BadRequestException();
            }
            return await this.authService.loginUser(body);
        } catch (err) {
            console.log(`loginUser`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't login.`,
            }
        }
    }

    @Post(`logout`)
    async logoutUser(
        @Body() body: LogoutUserDto,
    ): Promise<logoutUserResponse> {
        try {
            return await this.authService.logoutUser(body);
        } catch (err) {
            console.log(`logoutUser`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't logout.`,
            }
        }
    }

    @Delete(`remove`)
    async removeUser(
        @Body() body: RemoveUserDto,
    ): Promise<RemoveUserResponse> {
        try {
            return await this.authService.removeUser(body);
        } catch (err) {
            console.log(`removeUser`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't removeUser.`,
            }
        }
    }

}