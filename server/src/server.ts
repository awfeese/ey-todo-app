import app from './app';
import config from './config';
import db, { initSchema } from './config/database';
import logger from './config/logger';

function start() {
    try {
        initSchema();
        logger.info('Initialized database schema');

        const server = app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port}`);
        });

        const shutdown = (signal: string) => {
            logger.info({ signal }, 'Shutting down');
            server.close(() => {
                db.close();
                process.exit(0);
            });
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (err) {
        logger.error({ err }, 'Failed to start server');
        process.exit(1);
    }
}

start();
