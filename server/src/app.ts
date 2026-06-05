import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import config from './config';

const app = express();

app.use(helmet());
app.use(cors(config.cors));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', routes);

export default app;
