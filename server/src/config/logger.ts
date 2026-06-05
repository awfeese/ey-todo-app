import pino from 'pino';
import config from './index';

const logger = pino({ level: config.logLevel });

export default logger;
