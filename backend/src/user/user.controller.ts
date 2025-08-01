import {
    AvatarResponse, CurrentUserResponse,
    DefaultResponse, UpdateUserResponse
} from "../../types/response.types";
import {
    Body, Controller, Delete, FileTypeValidator, Get,
    HttpStatus, MaxFileSizeValidator, Param,
    ParseFilePipe,
    Patch, Post, Put, Req, Res, UploadedFile, UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { diskStorage } from "multer";
import { UpdatePermissionsDto } from "../auth/dtos/updatePermissions.dto";
import { UpdateStatusDto } from "../auth/dtos/updateEmailStatus.dto";
import { UpdateWholeUserDto } from "../auth/dtos/updateUser.dto";
import { RemoveEmailDto } from "../auth/dtos/removeEmail.dto";
import { UpdatePswdDto } from "../auth/dtos/updatePassword.dto";
import { RemoveUserDto } from "../auth/dtos/removeUser.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { SoftAuthGuard } from "../auth/auth.guard";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import * as path from "node:path";
import * as fs from "node:fs";
import { LoggerService } from "../utils/logs.service";

@Controller('/api/user')

export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly logger: LoggerService,
    ) { }

    @UseGuards(SoftAuthGuard)
    @Get(':id')
    async findCurrentUserData(
        @Param(`id`) id: number,
        @Req() req: Request
    ): Promise<CurrentUserResponse> {
        try {
            return await this.userService.findCurrentUserData(id, req);
        } catch (err) {
            console.log('findCurrentUserData error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve current user data.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Get('avatar/:id')
    async findAvatar(
        @Param(`id`) id: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<AvatarResponse> {
        const startTime = Date.now();

        try {

            const path_ = path.join(__dirname, `../../../../avatars/${id}.jpg`);
            if (fs.existsSync(path_)) {

                await this.logger.received({
                    label: `Profile picture found.`,
                    description: `Profile picture for user with id: ${id}. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime
                })
                res.status(HttpStatus.OK).sendFile(path_);

            } else {

                const err = new Error('Image not found.');
                res.status(HttpStatus.NOT_FOUND).json({
                    status: HttpStatus.NOT_FOUND,
                    message: await this.logger.fail({
                        label: `Avatar doesn't exist`,
                        description: `Image for userwith ID: ${id} doesn't exist. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                        startTime, err
                    }),
                })

            }

        } catch (err) {

            console.log('findAvatar error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Avatar for user with ID: ${id} doesn't exist`,
                    description: `Image for userwith ID: ${id} doesn't exist. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err,
                }),
            }

        }
    }

    @UseGuards(SoftAuthGuard)
    @Post('avatar/:id')
    @UseInterceptors(FileInterceptor(`image`, {
        storage: diskStorage({
            destination: `./avatars`,
            filename: (req, file: Express.Multer.File, next) => {
                next(null, `${req.params.id}.jpg`);
            }
        })
    }))
    async setAvatar(
        @Param('id') id: number,
        @Req() req: Request,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 24000000 }),
                    new FileTypeValidator({ fileType: 'image/jpeg' }),
                ]
            })) image,
    ): Promise<DefaultResponse> {
        const startTime = Date.now();
        try {

            return {
                status: HttpStatus.OK,
                message: await this.logger.created({
                    label: `Avatar created successfully.`,
                    description: `Avatar for user with ID: ${id} created successfully. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                })
            }

        } catch (err) {

            console.log('deleteAvatar error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Failed to set avatar.`,
                    description: `Failed to set avatar for user with ID: ${id}. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                }),
            }

        }
    }

    @UseGuards(SoftAuthGuard)
    @Delete('avatar/:id')
    async deleteAvatar(
        @Param(`id`) id: number,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<DefaultResponse> {
        const startTime = Date.now();
        try {

            const path_ = path.join(__dirname, `../../../../avatars/${id}.jpg`);
            if (fs.existsSync(path_)) {
                fs.unlinkSync(path_);
                res.status(HttpStatus.OK).json({
                    message: await this.logger.deleted({
                        label: `Avatar removed.`,
                        description: `Avatar of user with ID: ${id} removed successfully. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                        startTime
                    }),
                    status: HttpStatus.OK,
                });

            } else {

                const err = new Error('Avatar not found.');
                res.status(HttpStatus.NOT_FOUND).json({
                    message: await this.logger.fail({
                        label: `Avatar doesn't exist`,
                        description: `Avatar for user with ID: ${id} doesn't exist. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                        startTime, err
                    }),
                    status: HttpStatus.NOT_FOUND,
                });

            }
        } catch (err) {

            console.log('deleteAvatar error: ', err);
            return {
                message: await this.logger.fail({
                    label: `Failed to delete avatar.`,
                    description: `Failed to delete avatar for user with ID: ${id}. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                }),
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            }

        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`status/:id`)
    async updateEmailStatus(
        @Param(`id`) id: number,
        @Body() body: UpdateStatusDto,
        @Req() req: Request,
    ): Promise<DefaultResponse> {
        try {
            return await this.userService.updateEmailStatus(id, body, req);
        } catch (err) {
            console.log('updateEmailStatus error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update email status.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`email/:id`)
    async removeEmail(
        @Param('id') id: number,
        @Body() body: RemoveEmailDto,
    ): Promise<DefaultResponse> {
        try {
            return await this.userService.removeEmail(id, body);
        } catch (err) {
            console.log(`removeEmail error: `, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to remove email.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`permissions`)
    async updatePermissions(
        @Body() body: UpdatePermissionsDto,
        @Req() req: Request,
    ): Promise<DefaultResponse> {
        try {
            return await this.userService.updatePermissions(body, req);
        } catch (err) {
            console.log('updatePermissions error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update permissions.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`password`)
    async updatePassword(
        @Body() body: UpdatePswdDto,
        @Req() req: Request,
    ): Promise<DefaultResponse> {
        try {
            return await this.userService.updatePassword(body, req);
        } catch (err) {
            console.log('updatePassword error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update password.`,
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Patch(`:id`)
    async updateUser(
        @Param(`id`) id: number,
        @Body() body: UpdateWholeUserDto,
        @Req() req: Request,
    ): Promise<UpdateUserResponse> {
        try {
            return await this.userService.updateUser(id, body, req);
        } catch (err) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to update user ${id}.`
            }
        }
    }

    @UseGuards(SoftAuthGuard)
    @Put(`:id`)
    async deactivateUser(
        @Param(`id`) id: number,
        @Body() body: RemoveUserDto,
        @Req() req: Request,
    ): Promise<DefaultResponse> {
        try {
            return await this.userService.deactivateUser(id, body, req);
        } catch (err) {
            console.log(`removeUser error:`, err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to remove user.`,
            }
        }
    }
}