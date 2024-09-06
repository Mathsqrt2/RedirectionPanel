import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Param, Post, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserResponse, RegisterUserResponse, RemoveUserResponse, SendVerificationCodeResponse, UpdatePswdResponse, VerifyEmailResponse } from './auth.types';
import { RemoveUserDto } from './dtos/removeUser.dto';
import { Request, Response } from 'express';
import { CodesDto } from './dtos/codes.dto';
import { AuthGuard } from './auth.guard';
import config from 'src/config';
import { UpdatePswdDTO } from './dtos/updatepswd.dto';

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

    @UseGuards(AuthGuard)
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

    @Post(`getVerificationEmail`)
    async sendVerificationEmail(
        @Body() body: CodesDto,
        @Req() req: Request,
    ): Promise<SendVerificationCodeResponse> {
        try {
            return await this.authService.sendVerificationEmail(body, req);
        } catch (err) {
            console.log('verifyEmail', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't handle verification`,
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get(`verify/:code`)
    @Redirect(`${config.frontend.domain}/verified`, 302)
    async recieveVerificationCode(
        @Param(`code`) code: string,
        @Req() req: Request,
    ): Promise<VerifyEmailResponse> {
        try {
            return await this.authService.recieveVerificationCode(code, req);
        } catch (err) {
            console.log('verifyEmail', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't verify request with code: ${code}`,
            }
        }
    }

    @UseGuards(AuthGuard)
    @Post(`updatepassword/:id`)
    async updatePassword(
        @Param('id') id: number,
        @Body() body: UpdatePswdDTO,
        @Req() req: Request,
    ): Promise<UpdatePswdResponse> {
        try {
            console.log(id,body)
            await this.authService.updatePassword(id, body, req);
        } catch (err) {
            console.log('verifyEmail', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't update password`,
            }
        }
    }

}