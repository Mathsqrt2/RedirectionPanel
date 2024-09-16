import {
    BadRequestException, Body, Controller,
    Get, HttpStatus,
    Param, Patch, Post,
    Redirect, Req, Res, UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import {
    CreateUserByPanelResponse,
    CurrentUserResponse, LoginUserResponse, RegisterUserResponse,
    RemoveUserResponse, ResponseWithCode, SendVerificationCodeResponse,
    SimpleResponse,
    UpdatePermissionsResponse, UpdatePswdResponse,
    UpdateStatusResponse, UpdateUserResponse, VerifyEmailResponse
} from './auth.types';
import { RemoveUserDto } from './dtos/removeUser.dto';
import { Request, Response } from 'express';
import { CodesDto } from './dtos/codes.dto';
import { SoftAuthGuard, StrictAuthGuard } from './auth.guard';
import config from 'src/config';
import { UpdatePswdDto } from './dtos/updatepswd.dto';
import { UpdatePermissionsDto } from './dtos/updatePermissions.dto';
import { UpdateStatusDto } from './dtos/updateEmailStatus.dto';
import { RemoveEmailDto } from './dtos/removeEmail.dto';
import { UpdateWholeUserDto } from './dtos/updateUser.dto';
import { CreateUserByPanelDto } from './dtos/createUserByPanel.dto';

@Controller(`api/auth`)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @UseGuards(SoftAuthGuard)
    @Get(`verifybyrequest/:code`)
    async getVerificationCode(
        @Param('code') code: string,
        @Req() req: Request,
    ): Promise<VerifyEmailResponse> {
        try {
            return await this.authService.getVerificationCode(code, req);
        } catch (err) {
            console.log('verifyEmail error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Verification failed for the request with code: "${code}".`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Get('activecode/:userid')
    async getActiveCode(
        @Param(`userid`) id: number,
        @Req() req: Request
    ): Promise<ResponseWithCode> {
        try {
            return await this.authService.getActiveCode(id, req);
        } catch (err) {
            console.log('getActiveCode error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve active code.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Get('currentuser/:id')
    async getCurrentUserData(
        @Param(`id`) id: number,
        @Req() req: Request
    ): Promise<CurrentUserResponse> {
        try {
            return await this.authService.getCurrentUserData(id, req);
        } catch (err) {
            console.log('getCurrentUserData error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve current user data.`,
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
            console.log('verifyEmail error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to verify request with code: "${code}".`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Post(`getverificationemail`)
    async sendVerificationEmail(
        @Body() body: CodesDto,
        @Req() req: Request,
    ): Promise<SendVerificationCodeResponse> {
        try {
            return await this.authService.sendVerificationEmail(body, req);
        } catch (err) {
            console.log('verifyEmail error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Verification process failed.`,
            }
        }
    }

    @UseGuards(StrictAuthGuard)
    @Post(`create/user`)
    async createUserByPanel(
        @Body() body: CreateUserByPanelDto,
        @Req() req: Request,
    ): Promise<CreateUserByPanelResponse | SendVerificationCodeResponse> {
        try {
            return await this.authService.createUserByPanel(body, req);
        } catch (err) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to create user.`
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
            console.log(`registerUser error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to register new user.`,
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
            console.log(`loginUser error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to log in.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`password`)
    async updatePassword(
        @Body() body: UpdatePswdDto,
        @Req() req: Request,
    ): Promise<UpdatePswdResponse> {
        try {
            return await this.authService.updatePassword(body, req);
        } catch (err) {
            console.log('updatePassword error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update password.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`permissions`)
    async updatePermissions(
        @Body() body: UpdatePermissionsDto,
        @Req() req: Request,
    ): Promise<UpdatePermissionsResponse> {
        try {
            return await this.authService.updatePermissions(body, req);
        } catch (err) {
            console.log('updatePermissions error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update permissions.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`update/email/:id`)
    async updateEmailStatus(
        @Param(`id`) id: number,
        @Body() body: UpdateStatusDto,
        @Req() req: Request,
    ): Promise<UpdateStatusResponse> {
        try {
            return await this.authService.updateEmailStatus(id, body, req);
        } catch (err) {
            console.log('updateEmailStatus error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update email status.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`remove/email/:id`)
    async removeEmail(
        @Param('id') id: number,
        @Body() body: RemoveEmailDto,
    ): Promise<SimpleResponse> {
        try {
            return await this.authService.removeEmail(id, body);
        } catch (err) {
            console.log(`removeEmail error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to remove email.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`deactivate/user/:id`)
    async deactivateUser(
        @Param(`id`) id: number,
        @Body() body: RemoveUserDto,
        @Req() req: Request,
    ): Promise<RemoveUserResponse> {
        try {
            return await this.authService.deactivateUser(id, body, req);
        } catch (err) {
            console.log(`removeUser error:`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to remove user.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`update/user/:id`)
    async updateWholeUser(
        @Param(`id`) id: number,
        @Body() body: UpdateWholeUserDto,
        @Req() req: Request,
    ): Promise<UpdateUserResponse | SendVerificationCodeResponse> {
        try {
            return await this.authService.updateUser(id, body, req);
        } catch (err) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update user ${id}.`
            }
        }
    }

}