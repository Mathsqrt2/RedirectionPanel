import * as env from 'dotenv';
env.config();

export default {
    port: process.env.PORT,
    secret: process.env.SECRET,
    origin1: process.env.ORIGIN1,
    origin2: process.env.ORIGIN2,
    mailer: {
        service: process.env.SMTP_SERVICE,
        secure: process.env.SMTP_SECURE,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        pass: process.env.SMTP_PASS,
        user: process.env.SMTP_USER,
    },
    database: {
        host: process.env.DBHOST,
        username: process.env.DBUSERNAME,
        password: process.env.DBPASSWORD,
        database: process.env.DATABASE,
    },
    frontend: {
        domain: process.env.ORIGIN2
    },
    backend: {
        domain: process.env.ORIGIN1
    }
}