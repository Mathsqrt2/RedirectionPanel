import * as env from 'dotenv';
env.config();

export default {
    port: process.env.PORT,
    secret: process.env.SECRET,
    origin: process.env.ORIGIN,
    database: {
        host: process.env.DBHOST,
        username: process.env.DBUSERNAME,
        password: process.env.DBPASSWORD,
        database: process.env.DATABASE,
    }
}