import {
    ConflictException, HttpStatus, Inject,
    Injectable, NotFoundException, UnauthorizedException
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
    CurrentUserResponse, LoginUser, LoginUserResponse, RegisterUser,
    RegisterUserResponse, RemoveUserProps, RemoveUserResponse,
    ResponseWithCode, User, SendVerificationCodeResponse,
    UpdatePermissionsResponse, UpdatePswdResponse,
    UpdateStatusResponse, VerifyEmailResponse,
    TransportDataType
} from './auth.types';

import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { Users } from 'src/database/orm/users/users.entity';
import { SHA256 } from 'crypto-js';
import { CodesDto } from './dtos/codes.dto';
import { Codes } from './orm/codes.entity';
import { Request } from 'express';
import config from 'src/config';
import { UpdatePswdDTO } from './dtos/updatepswd.dto';
import { UpdatePermissionsDTO } from './dtos/updatePermissions.dto';
import { UpdateStatusDTO } from './dtos/updateEmailStatus.dto';
import { LoggerService } from 'src/utils/logs.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(`CODES`) private codes: Repository<Codes>,
        @Inject(`USERS`) private users: Repository<Users>,
        private dataSource: DataSource,
        private jwtService: JwtService,
        private logger: LoggerService,
    ) { }

    public getVerificationCode = async (code: string, req: Request): Promise<VerifyEmailResponse> => {
        code = code.trim();
        const startTime = Date.now();

        try {

            const codeRead = await this.codes.findOneBy({ code });

            if (!codeRead) {
                throw new ConflictException(`Code doesn't exist`);
            }

            if (Date.now() > codeRead.expireDate || !codeRead.status) {
                throw new ConflictException(`The code ${codeRead.code} has expired`);
            }

            let user = await this.users.findOneBy({ id: codeRead.userId });

            if (!user) {
                throw new ConflictException(`User assigned to this code doesn't exist now`);
            }

            user = { ...user, email: codeRead.email, canCreate: true, canUpdate: true };

            await this.users.save({ ...user });
            const { canCreate, canUpdate, canDelete, canManage } = user;
            const content = {
                permissions: { canCreate, canUpdate, canDelete, canManage },
                login: user.login,
                userId: user.id,
            }

            await this.codes.save({ ...codeRead, status: false });

            await this.logger.completed({
                label: `User verified`,
                description: `User "${user.login}" has been verified with email: "${user.email}". From ip: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return {
                status: HttpStatus.OK,
                message: `User ${user.login} verified successfully.`,
                content
            }

        } catch (err) {

            await this.logger.fail({
                label: `Couldn't verify user`,
                description: `email verification request from: "${req?.ip}" couldn't be handled. Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err
            })

            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Couldn't verify user`,
            }
        }
    }

    private hideEmailDetails = (email: string) => {
        const parts: string[] = email.split("@");

        const firstPartLength = parts[0].length;

        let firstPart = parts[0].substring(0, Math.floor(firstPartLength / 3));
        for (let i = 0; i <= Math.floor(firstPartLength / 3); i++) {
            firstPart += '*'
        }

        const lastPartLength = parts[1].length;
        let lastPart = parts[1].substring(Math.floor(lastPartLength / 3), lastPartLength);
        let stars = ""
        for (let i = 0; i <= Math.floor(lastPartLength / 3); i++) {
            stars += '*'
        }
        lastPart = `${stars}${lastPart}`;

        return `${firstPart}@${lastPart}`;
    }

    public getActiveCode = async (id: number, req: Request): Promise<ResponseWithCode> => {
        const startTime = Date.now();

        try {

            const code = await this.dataSource.getRepository(Codes).findOneBy({ userId: id, status: true });

            if (!code) {
                throw new ConflictException(`Code for user with id: "${id}" doesn't exist`);
            }

            if (Date.now() > code.expireDate) {
                throw new ConflictException(`Last code for user with id: "${id}" has expired`)
            }


            const content = {
                id: code.id,
                userId: code.userId,
                status: code.status,
                expireDate: code.expireDate,
                email: this.hideEmailDetails(code.email)
            }

            await this.logger.completed({
                label: `Active code was found`,
                description: `Active code was found: ${code.code}. From ip: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return {
                status: HttpStatus.OK,
                message: `Active code was found`,
                content,
            }

        } catch (err) {

            await this.logger.fail({
                label: `Error while trying to get activeCode`,
                description: `Active code couldn't be found for user with id: "${id}", From ip: "${req?.ip}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err
            })

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
            }
        }

    }

    public getCurrentUserData = async (id: number, req: Request): Promise<CurrentUserResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ id });

            const permissions = {
                canDelete: user.canDelete,
                canUpdate: user.canUpdate,
                canCreate: user.canCreate,
                canManage: user.canManage,
            }

            const content: User = {
                username: user.login,
                permissions,
                userId: user.id,
                email: user.email,
                emailSent: user.emailSent,
            };

            await this.logger.completed({
                label: `User data was found`,
                description: `Data for user: "${user.login}" was found. From ip: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return {
                status: HttpStatus.OK,
                message: `User data was found successfully`,
                content,
            }

        } catch (err) {

            await this.logger.fail({
                label: `Error while trying to get current user data`,
                description: `Current user data couldn't be found for user with id: "${id}", From ip: "${req?.ip}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err
            })

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
            }
        }

    }

    private isEmailValid = (email: string): boolean => {
        const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return pattern.test(email);
    }

    private randomNumber = (min: number, max: number): Number => {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public sendVerificationEmail = async ({ email, userId }: CodesDto, req: Request): Promise<SendVerificationCodeResponse> => {

        const startTime = Date.now();

        if (!email) {
            throw new ConflictException(`Email is required`);
        }

        if (!this.isEmailValid(email)) {
            throw new ConflictException(`incorrect email`);
        }

        if (await this.users.findOneBy({ email })) {
            throw new ConflictException(`The email is already in use`);
        }

        if (!userId) {
            throw new ConflictException(`User id is required`);
        }

        const user = await this.users.findOneBy({ id: userId });

        if (!user) {
            throw new NotFoundException(`User with id${userId} not found`);
        }

        if (user.email) {
            throw new ConflictException(`The user is already verified`);
        }

        const options: nodemailer.TransportOptions & TransportDataType = {
            host: config.mailer.host,
            port: config.mailer.port,
            secure: false,
            service: config.mailer.service,
            auth: {
                user: config.mailer.user,
                pass: config.mailer.pass,
            },
        };

        const transport = nodemailer.createTransport<TransportDataType>(options)

        let code = "";
        for (let i = 0; i < 9; i++) {
            code += this.randomNumber(0, 9);
        }

        try {
            const creationTime = new Date();
            const expireTime = new Date().setDate(creationTime.getDate() + 1);

            const text = `Your verification code is: ${code}. 
            It is active for one day, and expires: ${(new Date(expireTime)).toLocaleDateString('pl-Pl')}.
            You can paste it in your profile or click the link <a href=${config.backend.domain}/api/auth/verify/${code}>${config.backend.domain}/verify/${code}</a>`;
            let html = `<h1>You're welcome</h1>
                <p>${text}</p>`;

            const existingCode = await this.codes.findOneBy({ status: true });
            if (existingCode) {
                existingCode.status = false;
                this.codes.save({ ...existingCode });
            }

            await this.codes.save({
                code,
                userId,
                status: true,
                email,
                expireDate: expireTime
            })

            await transport.sendMail({
                from: config.mailer.user,
                to: email,
                subject: 'Verification code in Redirection Panel Service',
                text: text,
                html: html,
            })

            await this.logger.completed({
                label: `Email send`,
                description: `User "${user.login}", Requested for email from: "${req?.ip}", The email has been sent, Time: ${new Date().toLocaleString('pl-PL')}}`,
                startTime,
            })

            return ({
                status: HttpStatus.OK,
                message: `Check your email: ${email}`,
            })

        } catch (err) {

            await this.logger.fail({
                label: `Email couldn't be send`,
                description: `User "${user.login}" requested for email from: "${req?.ip}" The email couldn't be sent. Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err
            })

            return ({
                status: HttpStatus.BAD_REQUEST,
                message: `Error while trying to send email. ${err}`,
            });
        }
    };

    private securePassword = (password: string): string => {
        const salt = SHA256(Date.now()).toString();
        return `${salt}$${SHA256(`${password}$${salt}`).toString()}`;
    }

    private comparePasswords = (password: string, saltedHash: string): boolean => {
        const parts = saltedHash.split('$');

        if (SHA256(`${password}$${parts[0]}`).toString() === parts[1]) {
            return true;
        }

        return false
    }

    public registerUser = async ({ login, password, confirmPassword, req }: RegisterUser): Promise<RegisterUserResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ login });

            if (user) {
                throw new ConflictException(`User already exists`);
            }

            if (password !== confirmPassword) {
                throw new ConflictException(`Confirm password mismatch`);
            }

            const newUser = await this.users.save<any>({
                login,
                password: this.securePassword(password),
                canDelete: false,
                canUpdate: false,
                canCreate: false,
                canManage: false,
            })

            const userId = (await this.users.findOneBy({ login })).id;

            const { canDelete, canUpdate, canCreate, canManage } = newUser;
            const payload = { sub: newUser.id, username: newUser?.login };

            await this.logger.completed({
                label: `User registered`,
                description: `"${login}" registered from ip: "${req?.ip}", canManage: "${canManage}", canCreate: "${canCreate}", canUpdate: "${canUpdate}", canDelete: "${canDelete}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return {
                status: HttpStatus.ACCEPTED,
                accessToken: await this.jwtService.signAsync(payload),
                login: newUser.login,
                permissions: { canDelete, canUpdate, canCreate, canManage },
                email: user.email,
                userId,
            };
        } catch (err) {

            await this.logger.fail({
                label: `Error while trying to register user`,
                description: `User couldn't be registered with login: "${login}", From ip: "${req?.ip}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err
            })

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            }
        }
    }

    public loginUser = async ({ login, password, req }: LoginUser): Promise<LoginUserResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ login });

            if (!user) {
                throw new UnauthorizedException(`Login or password incorrect`);
            }

            if (!this.comparePasswords(password, user.password)) {
                throw new UnauthorizedException(`Login or password incorrect`);
            }

            const payload = { sub: user.id, username: user.login };
            const accessToken = await this.jwtService.signAsync(payload);

            const { canDelete, canUpdate, canCreate, canManage } = user;
            await this.logger.completed({
                label: `Signed in`,
                description: `User with login: "${login}", Signed in from ip: "${req?.ip}", canManage: "${canManage}", canCreate: "${canCreate}", canUpdate: "${canUpdate}", canDelete: "${canDelete}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return {
                status: HttpStatus.OK,
                accessToken,
                login: user.login,
                userId: user.id,
                email: user.email,
                permissions: { canDelete, canUpdate, canCreate, canManage }
            };
        } catch (err) {

            await this.logger.fail({
                label: `error while trying to sign in`,
                description: `Someone tried to sign in as: "${login}", From ip: "${req?.ip}", Couldn't signed in. Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err
            })

            return {
                status: HttpStatus.BAD_REQUEST
            }
        }

    }

    public updatePassword = async (body: UpdatePswdDTO, req: Request): Promise<UpdatePswdResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ id: body.userId });

            if (!user) {
                throw new ConflictException(`User with id: ${body.userId} doesn't exist`);
            }

            if (body.newPassword !== body.confirmPassword) {
                throw new ConflictException(`Passwords must be equal`);
            }

            if (!this.comparePasswords(body.password, user.password)) {
                throw new UnauthorizedException(`Incorrect password`);
            }

            user.password = this.securePassword(body.newPassword);
            await this.users.save({ ...user });

            await this.logger.completed({
                label: `Password changed`,
                description: `"${user.login}" password has been changed from ip: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return {
                status: HttpStatus.OK,
                message: 'Password updated successfully'
            }

        } catch (err) {

            await this.logger.fail({
                label: `Error while trying to change password`,
                description: `Password couldn't be changed for user with id: "${body.userId}", From ip: "${req?.ip}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err
            })

            return {
                status: HttpStatus.UNAUTHORIZED,
                message: err.message,
            }
        }
    }

    public updatePermissions = async (body: UpdatePermissionsDTO, req: Request): Promise<UpdatePermissionsResponse> => {
        const startTime = Date.now();

        try {

            let user = await this.users.findOneBy({ id: body.userId });

            if (!user) {
                throw new NotFoundException(`User with id: ${body.userId} doesn't exist`);
            }

            if (!user.canManage) {
                throw new UnauthorizedException(`Couldn't manage users. Insufficient permissions`);
            }

            user = await this.users.save({ ...user, ...body });

            await this.logger.completed({
                label: `Permissions have been updated`,
                description: `User: "${user.login}" permissions was updated to: canManage: "${user.canManage}", canCreate: "${user.canCreate}",
                 canUpdate: "${user.canUpdate}", canDelete: "${user.canDelete}". Request ip: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return {
                status: HttpStatus.OK,
                message: 'Permissions updated successfully',
            }
        } catch (err) {

            await this.logger.fail({
                label: `Error while trying to update permissions`,
                description: `Permissions couldn't be updated for user with id: "${body.userId}", From ip: "${req?.ip}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Couldn't update permissions`,
            }
        }
    }

    public updateEmailStatus = async (id: number, body: UpdateStatusDTO, req: Request): Promise<UpdateStatusResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ id })

            if (!user) {
                throw new NotFoundException(`User with id: ${id} doesn't exist`);
            }

            user.emailSent = body.emailSent;

            if (body.emailSent === false) {
                user.email = null;
                const code = await this.dataSource.getRepository(Codes).findOneBy({ userId: user.id, status: true });

                if (code) {
                    code.status = false;
                    await this.dataSource.getRepository(Codes).save({ ...code });
                }
            }

            await this.users.save({ ...user });

            await this.logger.completed({
                label: `User email status updated successfully`,
                description: `User: "${user.login}" email status was updated to: {enailSent:${body.emailSent}}. Request ip: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return {
                status: HttpStatus.OK,
                message: "User email status updated successfully",
            }

        } catch (err) {

            await this.logger.fail({
                label: `Error while trying to update email status`,
                description: `Email status couldn't be updated for user with id: "${id}", From ip: "${req?.ip}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
            }
        }
    }

    public removeUser = async ({ login, password }: RemoveUserProps): Promise<RemoveUserResponse> => {

        const startTime = Date.now();

        try {
            const user = await this.users.findOneBy({ login });

            if (!user) {
                throw new NotFoundException(`Login or password incorrect`)
            }

            if (this.comparePasswords(password, user.password)) {
                await this.users.delete({ login, password });
            } else {
                throw new UnauthorizedException(`Access denied.`);
            }

            await this.logger.completed({
                label: `User removed`,
                description: `User with login: "${login}" removed, Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime,
            })

            return { status: HttpStatus.ACCEPTED }
        } catch (err) {

            await this.logger.fail({
                label: `Error while trying to remove user`,
                description: `User with login: "${login}" couldn't be removed. Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}`,
                startTime, err,
            })

            return { status: HttpStatus.INTERNAL_SERVER_ERROR }
        }

    }

}