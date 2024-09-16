import {
    ConflictException, HttpStatus, Inject,
    Injectable, NotFoundException, UnauthorizedException
} from '@nestjs/common';
;
import {
    CurrentUserResponse, LoginUserResponse,
    RegisterUserResponse, DefaultResponse,
    ResponseWithCode,
    UpdateUserResponse
} from '../../../types/response.types';
import {
    LoginUser, RegisterUser,
    User
} from '../../../types/property.types';

import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { Users } from '../database/orm/users/users.entity';
import { SHA256 } from 'crypto-js';
import { Codes } from './orm/codes.entity';
import { Request } from 'express';
import config from '../config';
import { UpdatePswdDto } from './dtos/updatepswd.dto';
import { UpdatePermissionsDto } from './dtos/updatePermissions.dto';
import { UpdateStatusDto } from './dtos/updateEmailStatus.dto';
import { LoggerService } from '../utils/logs.service';
import { RemoveEmailDto } from './dtos/removeEmail.dto';
import { RemoveUserDto } from './dtos/removeUser.dto';
import { UpdateWholeUserDto } from './dtos/updateUser.dto';
import { CreateUserByPanelDto } from './dtos/createUserByPanel.dto';
import { CodeService } from '../code/code.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(`USERS`) private readonly users: Repository<Users>,
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
        private readonly codeService: CodeService,
        private readonly logger: LoggerService,
    ) { }

    public getCurrentUserData = async (id: number, req: Request): Promise<CurrentUserResponse> => {

        const startTime = Date.now();

        try {

            const user = await this.users.findOneBy({ id });

            if (!user) {
                throw new NotFoundException(`User with id: "${id}" not found.`)
            }

            const permissions = {
                canCreate: user.canCreate,
                canUpdate: user.canUpdate,
                canDelete: user.canDelete,
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
                status: HttpStatus.OK,
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

    public updatePassword = async (body: UpdatePswdDto, req: Request): Promise<DefaultResponse> => {

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

    public updatePermissions = async (body: UpdatePermissionsDto, req: Request): Promise<DefaultResponse> => {
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

    public updateEmailStatus = async (id: number, body: UpdateStatusDto, req: Request): Promise<DefaultResponse> => {

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

    public updateUser = async (id: number, body: UpdateWholeUserDto, req: Request): Promise<UpdateUserResponse | DefaultResponse> => {

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
                return await this.codeService.sendVerificationEmail({ email: body.newEmail, id }, req);
            }

            await this.users.save(user);

            return {
                status: HttpStatus.OK,
                message: await this.logger.updated({
                    label: `User updated.`,
                    description: `User with id: ${user.id} updated successfully. Request IP: "${req?.ip}". Time: ${new Date().toLocaleString('pl-PL')}. `,
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

    public createUserByPanel = async (body: CreateUserByPanelDto, req: Request): Promise<DefaultResponse | DefaultResponse> => {

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
                if (!checkEmail) {
                    const email = await this.codeService.sendVerificationEmail({ email: body.email, id: instance.id }, req);
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

    public deactivateUser = async (id: number, { password, login }: RemoveUserDto, req: Request): Promise<DefaultResponse> => {

        const startTime = Date.now();

        try {

            const checkPermissions = JSON.parse(req?.cookies?.jwt);
            const token = await this.jwtService.verifyAsync(checkPermissions.accessToken, { secret: config.secret });

            const admin = await this.users.findOneBy({ id: token.sub });
            const user = await this.users.findOneBy({ id });

            if (!admin.canManage) {

                if (!user) {
                    throw new NotFoundException(`User with id: ${id} doesn't exists.`);
                }

                if (user.login !== login) {
                    throw new NotFoundException(`Login or password incorrect.`)
                }

                if (!this.comparePasswords(password, user.password)) {
                    throw new UnauthorizedException(`Access denied.`);
                }
            }

            await this.users.delete({ login: user.login });

            return {
                status: HttpStatus.OK,
                message: await this.logger.deleted({
                    label: `User with ID: ${user.id} removed.`,
                    description: `User with login: "${user.login}" was removed by ${admin.login}. Request IP: ${req.ip}. Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime,
                })
            }
        } catch (err) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: await this.logger.fail({
                    label: `Error while trying to remove user.`,
                    description: `User with ID: "${id}" couldn't be removed. Request IP: ${req.ip}. Error: "${err}". Time: ${new Date().toLocaleString('pl-PL')}.`,
                    startTime, err,
                })
            }
        }
    }

    public removeEmail = async (id: number, { password }: RemoveEmailDto): Promise<DefaultResponse> => {

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
                status: HttpStatus.OK,
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