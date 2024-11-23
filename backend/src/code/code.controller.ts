import { Body, Controller, Get, Param, Post, Redirect, Req, UseGuards } from "@nestjs/common";
import { DefaultResponse, ResponseWithCode, VerifyEmailResponse } from "types/response.types";
import { SoftAuthGuard } from "../auth/auth.guard";
import { CodesDto } from "../auth/dtos/codes.dto";
import { CodeService } from "./code.service";
import { HttpStatus } from "@nestjs/common";
import { Request } from "express";
import config from "../config";

@Controller('api/code')

export class CodeController {

    constructor(
        private readonly codeService: CodeService,
    ) { }

    @UseGuards(SoftAuthGuard)
    @Get('user/:userid')
    async findActiveCode(
        @Param(`userid`) id: number,
        @Req() req: Request
    ): Promise<ResponseWithCode> {
        try {

            return await this.codeService.findActiveCode(id, req);

        } catch (err) {

            console.log('findActiveCode error: ', err);
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Failed to retrieve active code.` }

        }
    }

    @Get(`confirm/:code`)
    @Redirect(`${config.frontend.domain}/admin/profile`, 302)
    async receiveVerificationCodeFromEmail(
        @Param(`code`) code: string,
        @Req() req: Request,
    ): Promise<VerifyEmailResponse> {
        try {

            return await this.codeService.receiveVerificationCode(code, req);

        } catch (err) {

            console.log('verifyEmail error: ', err);
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Failed to verify request with code: "${code}".` }

        }
    }

    @UseGuards(SoftAuthGuard)
    @Get(`:code`)
    async receiveVerificationCode(
        @Param('code') code: string,
        @Req() req: Request,
    ): Promise<VerifyEmailResponse> {
        try {

            return await this.codeService.receiveVerificationCode(code, req);

        } catch (err) {

            console.log('verifyEmail error: ', err);
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Verification failed for the request with code: "${code}".` }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Post()
    async sendVerificationEmail(
        @Body() body: CodesDto,
        @Req() req: Request,
    ): Promise<DefaultResponse> {
        try {

            return await this.codeService.sendVerificationEmail(body, req);

        } catch (err) {

            console.log('verifyEmail error: ', err);
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Verification process failed.` }

        }
    }
}