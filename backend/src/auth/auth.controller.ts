import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserResponse, RegisterUserResponse, RemoveUserResponse } from './auth.types';
import { RemoveUserDto } from './dtos/removeUser.dto';
import { Request, Response } from 'express';
import { VerifyEmailDto } from './dtos/verifyEmail.dto';

@Controller(`api/auth`)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post(`register`)
    async registerUser(
        @Body() body: RegisterUserDto,
        @Res({ passthrough: true }) response: Response,
        @Req() req: Request,
    ): Promise<RegisterUserResponse> {
        try {
            const newUser = await this.authService.registerUser({ ...body, req });
            response.cookie('jwt', newUser.status, { httpOnly: true });
            return newUser;
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
        @Res({ passthrough: true }) response: Response,
        @Req() req: Request,
    ): Promise<LoginUserResponse> {
        try {

            if (!body.login || !body.password) {
                throw new BadRequestException();
            }

            const accessToken = await this.authService.loginUser({ ...body, req })
            response.cookie('jwt', accessToken, { httpOnly: true });
            return accessToken;

        } catch (err) {
            console.log(`loginUser`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't login.`,
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

    @Post(`sendVerificationEmail`)
    async sendVerificationEmail(
        @Body() body: VerifyEmailDto,
    ) {
        try {
            return await this.authService.sendVerificationEmail(body);
        } catch (err) {
            console.log('verifyEmail', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't handle verification`,
            }
        }
    }

    @Get(`verifyEmail/:id`)
    async verifyEmail(
        @Param(`id`) id: string
    ) {
        try {
            return await this.verifyEmail(id);
        } catch (err) {
            console.log('verifyEmail', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't verify url ${id}`,
            }
        }
    }

}