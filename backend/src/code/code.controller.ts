import { Body, Controller, Get, Param, Post, Redirect, Req, UseGuards } from "@nestjs/common";
import { SoftAuthGuard } from "../auth/auth.guard";
import { DefaultResponse, ResponseWithCode, VerifyEmailResponse } from "types/response.types";
import { CodeService } from "./code.service";
import { HttpStatus } from "@nestjs/common";
import { Request } from "express";
import { CodesDto } from "../auth/dtos/codes.dto";
import config from "../config";

@Controller('api/code')

export class CodeController {

    constructor(
        private readonly codeService: CodeService,
    ) { }

    @UseGuards(SoftAuthGuard)
    @Get('user/:userid')
    async getActiveCode(
        @Param(`userid`) id: number,
        @Req() req: Request
    ): Promise<ResponseWithCode> {
        try {
            return await this.codeService.getActiveCode(id, req);
        } catch (err) {
            console.log('getActiveCode error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve active code.`,
            }
        }
    }

    @Get(`confirm/:code`)
    @Redirect(`${config.frontend.domain}/admin/profile`, 302)
    async getVerificationCodeFromEmail(
        @Param(`code`) code: string,
        @Req() req: Request,
    ): Promise<VerifyEmailResponse> {
        try {
            return await this.codeService.getVerificationCode(code, req);
        } catch (err) {
            console.log('verifyEmail error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to verify request with code: "${code}".`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Get(`:code`)
    async getVerificationCode(
        @Param('code') code: string,
        @Req() req: Request,
    ): Promise<VerifyEmailResponse> {
        try {
            return await this.codeService.getVerificationCode(code, req);
        } catch (err) {
            console.log('verifyEmail error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Verification failed for the request with code: "${code}".`,
            }
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
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Verification process failed.`,
            }
        }
    }

}