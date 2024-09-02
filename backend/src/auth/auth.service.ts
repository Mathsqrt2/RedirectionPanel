import {
    ConflictException, HttpStatus, Inject, Injectable,
    NotFoundException, UnauthorizedException
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
    LoginUser, LoginUserResponse, RegisterUser,
    RegisterUserResponse, RemoveUserProps, RemoveUserResponse,
    VerifyEmailResponse,
} from './auth.types';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Users } from 'src/database/orm/users/users.entity';
import { SHA256 } from 'crypto-js';
import { Logs } from 'src/database/orm/logs/logs.entity';
import { VerifyEmailDto } from './dtos/verifyEmail.dto';
import config from 'src/config';
import { VerifyEmail } from './orm/verifyEmail.entity';

@Injectable()

export class AuthService {
    constructor(
        private jwtService: JwtService,
        @Inject(`USERS`) private readonly users: Repository<Users>,
        @Inject(`LOGS`) private readonly logs: Repository<Logs>,
        @Inject(`VERIFY`) private readonly verify: Repository<VerifyEmail>
    ) { }

    private securePassword = (password: string): string => {
        const salt = SHA256(new Date()).toString();
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

            await this.logs.save({
                label: `User registered`,
                description: `${login} registered from ip: "${req?.ip}", canManage: ${canManage}, canCreate: ${canCreate}, canUpdate: ${canUpdate}, canDelete: ${canDelete}`,
                status: `success`,
                duration: Math.floor(Date.now() - startTime),
            })

            return {
                status: HttpStatus.ACCEPTED,
                accessToken: await this.jwtService.signAsync(payload),
                login: newUser.login,
                permissions: { canDelete, canUpdate, canCreate, canManage },
                userId,
            };
        } catch (err) {
            console.log(`registerUser`, err);

            await this.logs.save({
                label: `Error while trying to register user`,
                description: `User couldn't be registered with login: "${login}" from ip: "${req?.ip}", ${err}`,
                status: `failed`,
                duration: Math.floor(Date.now() - startTime),
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

            await this.logs.save({
                label: `Signed in`,
                description: `User with login: "${login}" signed in from ip: "${req?.ip}", canManage: ${canManage}, canCreate: ${canCreate}, canUpdate: ${canUpdate}, canDelete: ${canDelete}. ${new Date()}`,
                status: `success`,
                duration: Math.floor(Date.now() - startTime),
            })

            return {
                status: HttpStatus.OK,
                accessToken,
                login: user.login,
                userId: user.id,
                permissions: { canDelete, canUpdate, canCreate, canManage }
            };
        } catch (err) {
            console.log(err);
            await this.logs.save({
                label: `error while trying to sign in`,
                description: `Someone tried to sign in: "${login}" from ip: "${req?.ip}" couldn't signed in. ${err}. ${new Date()}`,
                status: `failed`,
                duration: Math.floor(Date.now() - startTime),
            })
            return {
                status: HttpStatus.BAD_REQUEST
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

            await this.logs.save({
                label: `User removed`,
                description: `User with login: "${login}" removed. ${new Date()}`,
                status: `success`,
                duration: Math.floor(Date.now() - startTime),
            })

            return { status: HttpStatus.ACCEPTED }
        } catch (err) {
            console.log(`removeUser`, err);

            await this.logs.save({
                label: `Error while trying to remove user`,
                description: `User with login: "${login}" couldn't be removed. ${err} ${new Date()}`,
                status: `failed`,
                duration: Math.floor(Date.now() - startTime),
            })

            return { status: HttpStatus.INTERNAL_SERVER_ERROR }
        }

    }

    private isEmailValid = (email: string): boolean => {
        const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return pattern.test(email);
    }

    private randomNumber = (min, max): Number => {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public sendVerificationEmail = async ({ email, userId }: VerifyEmailDto): Promise<VerifyEmailResponse> => {

        const startTime = Date.now();

        if (!email) {
            throw new ConflictException(`Email is required`);
        }

        if (!this.isEmailValid(email)) {
            throw new ConflictException(`incorrect email`);
        }

        if (!userId) {
            throw new ConflictException(`User id is required`);
        }

        const user = this.users.findOneBy({ id: userId });

        if (!user) {
            throw new NotFoundException(`User with id${userId} not found`);
        }

        try {
            const options: nodemailer.TransportOptions & transportDataType = {
                service: config.mailer.service,
                host: config.mailer.host,
                port: config.mailer.port,
                secure: false,
                auth: {
                    user: config.mailer.user,
                    pass: config.mailer.pass,
                }
            };

            const transport = nodemailer.createTransport(options)

            let code = "";

            for (let i = 0; i < 9; i++) {
                code += this.randomNumber(0, 9);
            }
            const creationTime = new Date();
            const expireTime = creationTime.getDate() + 1;

            const text = `Your verification code is: ${code}. It is active for one day, and expires: ${new Date().setDate(expireTime)}`
            let html = `<h1>You're welcome</h1>
                <p>${text}</p>`;


            await transport.sendMail({
                from: config.mailer.user,
                to: email,
                subject: 'Verification code',
                text: html,
                html: html,
            })

            return ({
                status: HttpStatus.OK,
            })
        } catch (err) {
            return ({
                status: HttpStatus.BAD_REQUEST,
            });
        }



    };

    public recieveVerificationCode = async (): Promise<any> =>{
        
    }

}



type transportDataType = {
    service: string,
    host: string,
    port: string,
    secure: boolean,
    auth: smtpAuth,
}

type smtpAuth = {
    user: string,
    pass: string,
}