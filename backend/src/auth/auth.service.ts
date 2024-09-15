import {
    ConflictException, HttpStatus, Inject,
    Injectable, NotFoundException, UnauthorizedException
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
    CurrentUserResponse, LoginUser, LoginUserResponse, RegisterUser,
    RegisterUserResponse, RemoveUserResponse,
    ResponseWithCode, User, SendVerificationCodeResponse,
    UpdatePermissionsResponse, UpdatePswdResponse,
    UpdateStatusResponse, VerifyEmailResponse,
    TransportDataType,
    SimpleResponse,
    UpdateUserResponse,
    CreateUserByPanelResponse
} from './auth.types';

import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { Users } from 'src/database/orm/users/users.entity';
import { SHA256 } from 'crypto-js';
import { CodesDto } from './dtos/codes.dto';
import { Codes } from './orm/codes.entity';
import { Request } from 'express';
import config from 'src/config';
import { UpdatePswdDto } from './dtos/updatepswd.dto';
import { UpdatePermissionsDto } from './dtos/updatePermissions.dto';
import { UpdateStatusDto } from './dtos/updateEmailStatus.dto';
import { LoggerService } from 'src/utils/logs.service';
import { RemoveEmailDto } from './dtos/removeEmail.dto';
import { RemoveUserDto } from './dtos/removeUser.dto';
import { UpdateWholeUserDto } from './dtos/updateUser.dto';
import { CreateUserByPanelDto } from './dtos/createUserByPanel.dto';

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
                throw new ConflictException(`The code does not exist.`);
            }

            if (Date.now() > codeRead.expireDate || !codeRead.status) {
                throw new ConflictException(`The code: "${codeRead.code}" has expired.`);
            }

            let user = await this.users.findOneBy({ id: codeRead.userId });

            if (!user) {
                throw new ConflictException(`The user assigned to this code no longer exists.`);
            }

            user = { ...user, email: codeRead.email, emailSent: null, canCreate: true, canUpdate: true };

            await this.users.save({ ...user });
            const { canCreate, canUpdate, canDelete, canManage } = user;
            const content = {
                permissions: { canCreate, canUpdate, canDelete, canManage },
                login: user.login,
                userId: user.id,
            }

            await this.codes.save({ ...codeRead, status: false });

            return {
                status: HttpStatus.OK,
                content,
                message: await this.logger.received({
                    label: `User has been verified.`,
                    description: `User: "${user.login}" has been verified with email: "${user.email}". IP: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                })
            }

        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `User verification failed.`,
                    description: `Email verification request from: "${req?.ip}" couldn't be processed. Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                }),
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
                throw new ConflictException(`The code for user with id: "${id}" does not exist.`);
            }

            if (Date.now() > code.expireDate) {
                throw new ConflictException(`The last code for user with id: "${id}" has expired.`)
            }

            const content = {
                id: code.id,
                userId: code.userId,
                status: code.status,
                expireDate: code.expireDate,
                email: this.hideEmailDetails(code.email)
            }

            return {
                status: HttpStatus.OK,
                content,
                message: await this.logger.received({
                    label: `Active code found.`,
                    description: `Active code found: "${code.code}". IP: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                }),
            }

        } catch (err) {

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Error retrieving active code.`,
                    description: `Active code not found for user with id: "${id}". IP: "${req?.ip}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                }),
            }
        }
    }

    public getCurrentUserData = async (id: number, req: Request): Promise<CurrentUserResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ id });

            if (!user) {
                throw new NotFoundException(`User with id: "${id}" not found.`)
            }

            const permissions = {
                canDelete: user.canDelete,
                canUpdate: user.canUpdate,
                canCreate: user.canCreate,
                canManage: user.canManage,
            }

            const content: User = {
                login: user.login,
                permissions,
                id: user.id,
                email: user.email,
                emailSent: user.emailSent,
            };

            return {
                status: HttpStatus.OK,
                content,
                message: await this.logger.received({
                    label: `User data found.`,
                    description: `Data for user: "${user.login}" was found. IP: "${req?.ip}", Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                }),
            }

        } catch (err) {

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Error retrieving current user data.`,
                    description: `Current user data not found for user with id: "${id}". IP: "${req?.ip}", Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                }),
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

    public sendVerificationEmail = async ({ email, id }: CodesDto, req: Request): Promise<SendVerificationCodeResponse> => {

        const startTime = Date.now();

        if (!email) {
            throw new ConflictException(`Email is required.`);
        }

        if (!this.isEmailValid(email)) {
            throw new ConflictException(`Incorrect email.`);
        }

        if (await this.users.findOneBy({ email })) {
            throw new ConflictException(`This email is already in use.`);
        }

        if (!id) {
            throw new ConflictException(`User ID is required.`);
        }

        const user = await this.users.findOneBy({ id });

        if (!user) {
            throw new NotFoundException(`User with ID: "${id}" not found.`);
        }

        await this.users.save({ ...user, email: null });


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
                It is active for one day and expires on ${(new Date(expireTime)).toLocaleDateString('pl-PL')}.
                You can paste it in your profile or click the link
                <a href=${config.backend.domain}/api/auth/verify/${code}>${config.backend.domain}/verify/${code}</a>.`
            let html = `<h1>You're welcome</h1>
                <p>${text}</p>`;

            const existingCode = await this.dataSource.getRepository(Codes).findOneBy({ id, status: true });

            if (existingCode) {
                existingCode.status = false;
                this.codes.save({ ...existingCode });
            }

            await this.codes.save({
                code,
                userId: id,
                status: true,
                email,
                expireDate: expireTime
            })

            await transport.sendMail({
                from: config.mailer.user,
                to: email,
                subject: 'Verification code in Redirection Panel Service.',
                text: text,
                html: html,
            })

            return ({
                status: HttpStatus.OK,
                message: await this.logger.completed({
                    label: `Email sent.`,
                    description: `User "${user.login}" requested email from IP: "${req?.ip}". 
                        Email has been sent. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                }),
            })

        } catch (err) {

            const user = await this.users.findOneBy({ id });

            if (user) {
                await this.users.save({ ...user, emailSent: false });
            } else {
                throw new NotFoundException(`User with id: ${id} not found`);
            }

            const code = await this.dataSource.getRepository(Codes).findOneBy({ id, status: true });

            if (code) {
                await this.dataSource.getRepository(Codes).save({ ...code, status: false });
            }

            return ({
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Email sending failed.`,
                    description: `User "${user.login}" requested an email from IP: "${req?.ip}". 
                        Email sending failed. Error: "${err}", Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                }),
            });
        }
    };

    private securePassword = (password: string): string => {
        const seed = `${Date.now()}`;
        const salt = SHA256(seed).toString();
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
                throw new ConflictException(`User already exists.`);
            }

            if (password !== confirmPassword) {
                throw new ConflictException(`Password confirmation does not match.`);
            }

            const newUser = await this.users.save({
                login,
                password: this.securePassword(password),
                canDelete: false,
                canUpdate: false,
                canCreate: false,
                canManage: false,
            })

            const { canDelete, canUpdate, canCreate, canManage } = newUser;
            const payload = { sub: newUser.id, username: newUser?.login };

            return {
                status: HttpStatus.ACCEPTED,
                accessToken: await this.jwtService.signAsync(payload),
                login: newUser.login,
                permissions: { canDelete, canUpdate, canCreate, canManage },
                userId: newUser.id,
                message: await this.logger.success({
                    label: `User registered.`,
                    description: `"${login}" registered from IP: "${req?.ip}". 
                        Permissions: canManage: "${canManage}", canCreate: "${canCreate}", canUpdate: "${canUpdate}", canDelete: "${canDelete}". 
                        Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                })
            };
        } catch (err) {

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Error while trying to register the user.`,
                    description: `User with login: "${login}" could not be registered. IP: "${req?.ip}".
                        Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                }),
            }
        }
    }

    public loginUser = async ({ login, password, req }: LoginUser): Promise<LoginUserResponse> => {

        const startTime = Date.now();

        try {
            let user;

            if (login.includes('@')) {
                user = await this.users.findOneBy({ email: login });
            } else {
                user = await this.users.findOneBy({ login });
            }

            if (!user) {
                throw new UnauthorizedException(`Login or password is incorrect.`);
            }

            if (!this.comparePasswords(password, user.password)) {
                throw new UnauthorizedException(`Login or password is incorrect.`);
            }

            const payload = { sub: user.id, username: user.login };
            const accessToken = await this.jwtService.signAsync(payload);

            const { canDelete, canUpdate, canCreate, canManage } = user;

            return {
                status: HttpStatus.OK,
                accessToken,
                login: user.login,
                userId: user.id,
                email: user.email,
                permissions: { canDelete, canUpdate, canCreate, canManage },
                message: await this.logger.success({
                    label: `Signed in.`,
                    description: `User with login: "${login}" signed in from IP: "${req?.ip}". 
                        Permissions: canManage: "${canManage}", canCreate: "${canCreate}", canUpdate: "${canUpdate}", canDelete: "${canDelete}". 
                        Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                })
            };
        } catch (err) {

            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Failed to sign in.`,
                    description: `Sign-in attempt failed for user "${login}" from IP: "${req?.ip}". 
                        Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                })
            }
        }
    }

    public updatePassword = async (body: UpdatePswdDto, req: Request): Promise<UpdatePswdResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ id: body.userId });

            if (!user) {
                throw new ConflictException(`User with ID: ${body.userId} doesn't exist.`);
            }

            if (body.newPassword !== body.confirmPassword) {
                throw new ConflictException(`Passwords must match.`);
            }

            if (!this.comparePasswords(body.password, user.password)) {
                throw new UnauthorizedException(`Incorrect password.`);
            }

            user.password = this.securePassword(body.newPassword);
            await this.users.save({ ...user });

            return {
                status: HttpStatus.OK,
                message: await this.logger.updated({
                    label: `Password changed.`,
                    description: `Password for "${user.login}" has been changed from IP: "${req?.ip}".
                        Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                })
            }

        } catch (err) {

            return {
                status: HttpStatus.UNAUTHORIZED,
                message: await this.logger.fail({
                    label: `Failed to change the password.`,
                    description: `Failed to change the password for user with ID: "${body.userId}".
                        IP: "${req?.ip}". Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                })
            }
        }
    }

    public updatePermissions = async (body: UpdatePermissionsDto, req: Request): Promise<UpdatePermissionsResponse> => {
        const startTime = Date.now();

        try {

            const checkPermissions = JSON.parse(req?.cookies?.jwt);
            const token = await this.jwtService.verifyAsync(checkPermissions.accessToken, { secret: config.secret });

            const admin = await this.users.findOneBy({ id: token.sub });
            let user = await this.users.findOneBy({ id: body.userId });

            if ((!admin?.canManage)) {
                throw new UnauthorizedException(`Unable to manage users. Insufficient permissions.`);
            }

            if (!user) {
                throw new NotFoundException(`User with ID: "${body.userId}" doesn't exist.`);
            }

            user = await this.users.save({ ...user, ...body });

            return {
                status: HttpStatus.OK,
                message: await this.logger.updated({
                    label: `Permissions updated successfully.`,
                    description: `User: "${user.login}" permissions were updated to: canManage: "${user.canManage}", canCreate: "${user.canCreate}",
                        canUpdate: "${user.canUpdate}", canDelete: "${user.canDelete}". Request IP: "${req?.ip}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                }),
            }

        } catch (err) {

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Error occurred during permission update.`,
                    description: `Permissions couldn't be updated for user with ID: "${body.userId}". 
                        IP: "${req?.ip}". Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err,
                }),
            }
        }
    }

    public updateEmailStatus = async (id: number, body: UpdateStatusDto, req: Request): Promise<UpdateStatusResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ id })

            if (!user) {
                throw new NotFoundException(`User with ID: ${id} doesn't exist.`);
            }

            user.emailSent = body.emailSent;

            if (body.newEmail) {
                user.email = body.newEmail;
            }

            if (body.emailSent === false) {
                user.email = null;
                const code = await this.dataSource.getRepository(Codes).findOneBy({ userId: user.id, status: true });

                if (code) {
                    code.status = false;
                    await this.dataSource.getRepository(Codes).save({ ...code });
                }
            }

            await this.users.save(user);

            return {
                status: HttpStatus.OK,
                message: await this.logger.updated({
                    label: `User email status updated successfully.`,
                    description: `User: "${user.login}" email status was updated to: {emailSent:${body.emailSent}}. 
                        Request IP: "${req?.ip}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                }),
            }

        } catch (err) {

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Error while trying to update email status.`,
                    description: `Email status couldn't be updated for user with ID: "${id}". 
                        IP: "${req?.ip}". Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err,
                }),
            }
        }
    }

    public updateUser = async (id: number, body: UpdateWholeUserDto, req: Request): Promise<UpdateUserResponse | SendVerificationCodeResponse> => {

        const startTime = Date.now();

        try {

            const payload = await this.jwtService.verifyAsync(body.adminToken, { secret: config.secret });

            if (!payload) {
                throw new UnauthorizedException(`Invalid token.`);
            }

            if (Date.now() > (payload?.exp * 1000)) {
                throw new UnauthorizedException(`Token expired.`);
            }

            const admin = await this.users.findOneBy({ id: payload.sub });

            if (!admin) {
                throw new UnauthorizedException(`Invalid token.`);
            }

            const user = await this.users.findOneBy({ id });

            if (body.newLogin) {
                user.login = body.newLogin;
            }

            if (body.newPassword) {
                user.password = this.securePassword(body.newPassword);
            }

            if (body.newEmail) {
                return await this.sendVerificationEmail({ email: body.newEmail, id }, req);
            }

            return {
                status: HttpStatus.ACCEPTED,
                message: await this.logger.updated({
                    label: `User updated.`,
                    description: `User ${1}`,
                    startTime,
                })
            }
        } catch (err) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: await this.logger.fail({
                    label: `Error while trying to update user`,
                    description: `User with id: ${id} couldn't be updated. IP: "${req?.ip}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err,
                })
            }
        }
    }

    public createUserByPanel = async (body: CreateUserByPanelDto, req: Request): Promise<CreateUserByPanelResponse | SendVerificationCodeResponse> => {

        const startTime = Date.now();

        try {

            const checkLogin = await this.users.findOneBy({ login: body.login });

            if (checkLogin) {
                throw new ConflictException(`This login is already in use.`);
            }

            const newUser = {
                login: body.login,
                password: this.securePassword(body.password),
                canCreate: body.canCreate,
                email: null,
                emailSent: false,
                canUpdate: body.canUpdate,
                canDelete: body.canDelete,
                canManage: body.canManage,
                jstimestamp: Date.now(),
            }

            const instance = await this.users.save(newUser);
            if (body.email) {
                const checkEmail = await this.users.findOneBy({ email: body.email });

                if (checkEmail) {
                    const email = await this.sendVerificationEmail({ email: body.email, id: instance.id }, req);
                    if (email.status === 200) {
                        await this.users.save({ ...instance, emailSent: true });
                    }
                }
            }

            return {
                status: HttpStatus.OK,
                message: await this.logger.completed({
                    label: `User created successfully`,
                    description: `User ${instance.login} was created., Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}`,
                    startTime,
                })
            }
        } catch (err) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Failed to create user from panel`,
                    description: `Failed to create user from IP: ${req.ip}, params: ${JSON.stringify(body)}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err
                })
            }
        }

    }

    public deactivateUser = async (id: number, { password, login }: RemoveUserDto): Promise<RemoveUserResponse> => {

        const startTime = Date.now();

        try {
            const user = await this.users.findOneBy({ id });

            if (!user) {
                throw new NotFoundException(`Login or password incorrect.`)
            }

            if (user.login !== login) {
                throw new UnauthorizedException(`You're not allowed to manage users`);
            }

            if (this.comparePasswords(password, user.password)) {
                await this.users.delete({ login: user.login });
            } else {
                throw new UnauthorizedException(`Access denied.`);
            }

            return {
                status: HttpStatus.ACCEPTED,
                message: await this.logger.deleted({
                    label: `User removed.`,
                    description: `User with login: "${user.login}" was removed. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                })
            }
        } catch (err) {

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Error while trying to remove user.`,
                    description: `User with ID: "${id}" couldn't be removed. Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err,
                })
            }
        }
    }

    public removeEmail = async (id: number, { password }: RemoveEmailDto): Promise<SimpleResponse> => {

        const startTime = Date.now();

        try {
            const user = await this.users.findOneBy({ id });

            if (!user) {
                throw new NotFoundException(`Login or password incorrect.`)
            }

            if (this.comparePasswords(password, user.password)) {
                await this.users.save({ ...user, emailSent: false, email: null });
            } else {
                throw new UnauthorizedException(`Access denied.`);
            }

            return {
                status: HttpStatus.ACCEPTED,
                message: await this.logger.deleted({
                    label: `User removed.`,
                    description: `User with login: "${user.login}" was removed. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                })
            }

        } catch (err) {

            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Error while trying to remove email.`,
                    description: `The email of the user with ID: "${id}" couldn't be removed. Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err,
                })
            }
        }
    }
}