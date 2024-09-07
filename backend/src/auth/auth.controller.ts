import {
    BadRequestException, Body, Controller,
    Delete, Get, HttpStatus,
    Param, Patch, Post, Query,
    Redirect, Req, Res, UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import {
    CurrentUserResponse, LoginUserResponse, RegisterUserResponse,
    RemoveUserResponse, ResponseWithCode, SendVerificationCodeResponse,
    UpdatePermissionsResponse, UpdatePswdResponse,
    UpdateStatusResponse, VerifyEmailResponse
} from './auth.types';
import { RemoveUserDto } from './dtos/removeUser.dto';
import { Request, Response } from 'express';
import { CodesDto } from './dtos/codes.dto';
import { AuthGuard } from './auth.guard';
import config from 'src/config';
import { UpdatePswdDTO } from './dtos/updatepswd.dto';
import { UpdatePermissionsDTO } from './dtos/updatePermissions.dto';
import { UpdateStatusDTO } from './dtos/updateEmailStatus.dto';

@Controller(`api/auth`)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @UseGuards(AuthGuard)
    @Get(`verifybyrequest/:code`)
    async getVerificationCode(
        @Param('code') code: string,
        @Req() req: Request,
    ): Promise<VerifyEmailResponse> {
        try {
            return await this.authService.getVerificationCode(code, req);
        } catch (err) {
            console.log('verifyEmail', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't verify request with code: ${code}`,
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('activecode/:userid')
    async getActiveCode(
        @Param(`userid`) id: number,
        @Req() req: Request
    ): Promise<ResponseWithCode> {
        try {
            return await this.authService.getActiveCode(id, req);
        } catch (err) {
            console.log('getActiveCode', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't get active code`,
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('currentuser/:id')
    async getCurrentUserData(
        @Param(`id`) id: number,
        @Req() req: Request
    ): Promise<CurrentUserResponse> {
        try {
            return await this.authService.getCurrentUserData(id, req);
        } catch (err) {
            console.log('getActiveCode', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't get active code`,
            }
        }
    }

    @Get(`verify/:code`)
    @Redirect(`${config.frontend.domain}/admin/profile`, 302)
    async getVerificationCodeFromEmail(
        @Param(`code`) code: string,
        @Req() req: Request,
    ): Promise<VerifyEmailResponse> {
        try {
            return await this.authService.getVerificationCode(code, req);
        } catch (err) {
            console.log('verifyEmail', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't verify request with code: ${code}`,
            }
        }
    }

    @UseGuards(AuthGuard)
    @Post(`getverificationemail`)
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
    @Patch(`password`)
    async updatePassword(
        @Body() body: UpdatePswdDTO,
        @Req() req: Request,
    ): Promise<UpdatePswdResponse> {
        try {
            return await this.authService.updatePassword(body, req);
        } catch (err) {
            console.log('updatePassword', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't update password`,
            }
        }
    }

    @UseGuards(AuthGuard)
    @Patch(`permissions`)
    async updatePermissions(
        @Body() body: UpdatePermissionsDTO,
        @Req() req: Request,
    ): Promise<UpdatePermissionsResponse> {
        try {
            return await this.authService.updatePermissions(body, req);
        } catch (err) {
            console.log('updatePermissions', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't update permissions`,
            }
        }
    }

    @UseGuards(AuthGuard)
    @Patch(`emailstatus/:id`)
    async updateEmailStatus(
        @Param(`id`) id: number,
        @Body() body: UpdateStatusDTO,
        @Req() req: Request,
    ): Promise<UpdateStatusResponse> {
        try {
            return await this.authService.updateEmailStatus(id, body, req);
        } catch (err) {
            console.log('updateEmailStatus', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't update email status`,
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
}