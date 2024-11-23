declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: number;

        DBPORT: number;
        DBHOST: string;
        DBUSERNAME: string;
        DBPASSWORD: string;
        DATABASE: string;
        
        ORIGIN1: string;
        ORIGIN2: string;
        SECRET: string;
        
        SMTP_SERVICE: string;
        SMTP_HOST: string;
        SMTP_PORT: string;
        SMTP_SECURE: boolean;
        SMTP_PASS: string;
        SMTP_USER: string;
        
        KEY: string;
        CERT: string;

    }
}