import { Response } from 'express';
import logger from '../config/logger';

export const success = <T = unknown>(res: Response, data?: T) => {
    return res.status(data === undefined ? 204 : 200).json({ data });
};

export const created = <T = unknown>(res: Response, data: T) => {
    return res.status(201).json({ data });
};

export const badRequest = (res: Response, message: string) => {
    return res.status(400).json({ error: message });
};

export const notFound = (res: Response, message = 'The requested resource was not found.') => {
    return res.status(404).json({ error: message });
};

export const serverError = (res: Response, err?: unknown) => {
    logger.error({ err }, 'Unhandled request error');
    return res.status(500).json({
        error: `The requested action can't be completed due to an unexpected issue.`
    });
};

export const unauthorized = (res: Response, message = 'You need to be authenticated to access this resource.') => {
    return res.status(401).json({ error: message });
};
