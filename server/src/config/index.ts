import path from 'node:path';
import { config } from 'dotenv';

config();

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
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },
};
