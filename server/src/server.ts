import app from './app';
import config from './config';
import { initSchema } from './config/database';
import logger from './config/logger';

function start() {
    try {
        initSchema();
        logger.info('Initialized database schema');

        app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port}`);
        });
    } catch (err) {
        logger.error({ err }, 'Failed to start server');
        process.exit(1);
    }
}

start();
