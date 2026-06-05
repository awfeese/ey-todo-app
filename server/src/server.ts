import app from './app';
import config from './config';
import { initSchema } from './config/database';

function start() {
    try {
        initSchema();
        console.log('Initialized database schema');

        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
