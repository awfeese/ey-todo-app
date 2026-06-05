import path from 'node:path';
import { config } from 'dotenv';

config({
    path: path.resolve(__dirname, '../../../.env')
});

export default {
    port: process.env.PORT || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
        path: path.resolve(__dirname, '../app.db')
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
        credentials: true,
    },
};
