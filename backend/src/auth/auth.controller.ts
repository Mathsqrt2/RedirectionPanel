import { BadRequestException, Body, Controller, Delete, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserResponse, logoutUserResponse, RegisterUserResponse, RemoveUserResponse } from './auth.types';
import { LogoutUserDto } from './dtos/logoutUser.dto';
import { RemoveUserDto } from './dtos/removeUser.dto';
import { Response } from 'express';
import { ReturnDocument } from 'typeorm';

@Controller(`api/auth`)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post(`register`)
    async registerUser(
        @Body() body: RegisterUserDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<RegisterUserResponse> {
        try {
            const accessToken = await this.authService.registerUser(body);
            response.cookie('jwt', accessToken, { httpOnly: true });
            return accessToken;
        } catch (err) {
            console.log(`registerUser`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't register new user. ${err}`,
            }
        }
    }

    @Post(`login`)
    async loginUser(
        @Body() body: LoginUserDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginUserResponse> {
        try {
            if (!body.login || !body.password) {
                throw new BadRequestException();
            }

            const accessToken = await this.authService.loginUser(body)
            response.cookie('jwt', accessToken, { httpOnly: true });
            return accessToken;

        } catch (err) {
            console.log(`loginUser`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't login. ${err}`,
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