import {
    AvatarResponse, CurrentUserResponse,
    DefaultResponse, UpdateUserResponse
} from "types/response.types";
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
import { UpdatePswdDto } from "../auth/dtos/updatepswd.dto";
import { RemoveUserDto } from "../auth/dtos/removeUser.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { SoftAuthGuard } from "../auth/auth.guard";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import * as path from "node:path";
import * as fs from "node:fs";

@Controller('/api/user')

export class UserController {

    constructor(
        private readonly userService: UserService,
    ) { }

    @UseGuards(SoftAuthGuard)
    @Get(':id')
    async getCurrentUserData(
        @Param(`id`) id: number,
        @Req() req: Request
    ): Promise<CurrentUserResponse> {
        try {
            return await this.userService.getCurrentUserData(id, req);
        } catch (err) {
            console.log('getCurrentUserData error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve current user data.`,
            }
        }
    }

    //@UseGuards(SoftAuthGuard)
    @Get('avatar/:id')
    async getAvatar(
        @Param(`id`) id: string,
        @Res() res: Response,
    ): Promise<AvatarResponse> {
        try {
            res.sendFile(path.join(__dirname, `../../../../avatars/${id}`));
            return { status: HttpStatus.OK };
            // return await this.userService.getAvatar();
        } catch (err) {
            console.log('getAvatar error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to get avatar.`,
            }
        }
    }

    // @UseGuards(SoftAuthGuard)
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
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 24000000 }),
                    new FileTypeValidator({ fileType: 'image/jpeg' }),
                ]
            })) image,
    ): Promise<DefaultResponse> {
        try {
            return {
                status: HttpStatus.OK,
                message: `Avatar for user with ID: ${id} created successfully.`
            }
        } catch (err) {
            console.log('deleteAvatar error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to set avatar.`,
            }
        }
    }

    // @UseGuards(SoftAuthGuard)
    @Delete('avatar/:id')
    async deleteAvatar(

    ): Promise<DefaultResponse> {
        try {
            return
        } catch (err) {
            console.log('deleteAvatar error: ', err);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to delete avatar.`,
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