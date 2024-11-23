import { ConflictException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserResponse, RegisterUserResponse, DefaultResponse } from '../../types/response.types';
import { LoginUser, RegisterUser } from '../../types/property.types';
import { CreateUserByPanelDto } from './dtos/createUserByPanel.dto';
import { Users } from '../database/orm/users/users.entity';
import { LoggerService } from '../utils/logs.service';
import { CodeService } from '../code/code.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { SHA256 } from 'crypto-js';
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        @Inject(`USERS`) private readonly users: Repository<Users>,
        private readonly jwtService: JwtService,
        private readonly codeService: CodeService,
        private readonly logger: LoggerService,
    ) { }

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
}