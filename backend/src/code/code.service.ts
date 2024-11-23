import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DefaultResponse, ResponseWithCode, VerifyEmailResponse } from "types/response.types";
import { Users } from "../database/orm/users/users.entity";
import { LoggerService } from "../utils/logs.service";
import { CodesDto } from "../auth/dtos/codes.dto";
import { DataSource, Repository } from "typeorm";
import { Codes } from "../auth/orm/codes.entity";
import * as nodemailer from 'nodemailer'
import { Request } from "express";
import { TransportDataType } from "types/property.types";

@Injectable()

export class CodeService {

    constructor(
        @Inject(`CODES`) private readonly codes: Repository<Codes>,
        @Inject(`USERS`) private readonly users: Repository<Users>,
        private readonly dataSource: DataSource,
        private readonly logger: LoggerService,
    ) { }

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

    public findActiveCode = async (id: number, req: Request): Promise<ResponseWithCode> => {
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

    private isEmailValid = (email: string): boolean => {
        const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return pattern.test(email);
    }

    private randomNumber = (min: number, max: number): Number => {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public sendVerificationEmail = async ({ email, id }: CodesDto, req: Request): Promise<DefaultResponse> => {

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
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
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
                <a href=${process.env.ORIGIN1}/api/code/confirm/${code}>${process.env.ORIGIN1}/${code}</a>.`
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
                from: process.env.SMTP_USER,
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
    }

    public receiveVerificationCode = async (code: string, req: Request): Promise<VerifyEmailResponse> => {
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

}