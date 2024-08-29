import env from 'dotenv';
env.config();

export default {
    port: process.env.PORT,
    database: {
        host: process.env.HOST,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    }
}