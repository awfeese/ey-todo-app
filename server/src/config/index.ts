import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({
    path: path.resolve(__dirname, '../../../.env'),
    quiet: true,
});

const assertRequiredConfig = () => {
    if (!config.jwt.secret) {
        throw new Error(
            'JWT_SECRET is not set. Copy .env.example to .env and set JWT_SECRET before starting the server.',
        );
    }
};

const config = {
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

export { assertRequiredConfig };
export default config;
