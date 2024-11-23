import { CreateUserByPanelDto } from './dtos/createUserByPanel.dto';
import { RegisterUserDto } from './dtos/registerUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import {
    DefaultResponse,
    LoginUserResponse, RegisterUserResponse,
} from '../../../types/response.types';
import {
    BadRequestException, Body, Controller,
    HttpStatus, Post,
    Req, Res,
    UseGuards
} from '@nestjs/common';
import { StrictAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';


@Controller(`api/auth`)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post(`signin`)
    async loginUser(
        @Body() body: LoginUserDto,
        @Res({ passthrough: true }) response: Response,
        @Req() req: Request,
    ): Promise<LoginUserResponse> {

        if (!body.login || !body.password) {
            throw new BadRequestException();
        }

        try {

            const accessToken = await this.authService.loginUser({ ...body, req })
            response.cookie('jwt', accessToken, { httpOnly: true });
            return accessToken;

        } catch (err) {

            console.log(`loginUser error: `, err);
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Failed to log in.` }

        }
    }

    @Post(`signup`)
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
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Failed to register new user.` }

        }
    }

    @UseGuards(StrictAuthGuard)
    @Post(`create`)
    async createUserByPanel(
        @Body() body: CreateUserByPanelDto,
        @Req() req: Request,
    ): Promise<DefaultResponse> {
        try {

            return await this.authService.createUserByPanel(body, req);

        } catch (err) {

            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Failed to create user.` }

        }
    }
}