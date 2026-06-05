import { Response } from 'express';

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
    return res.status(500).json({
        error: (err as Error)?.message || `The requested action can't be completed due to an unexpected issue.`
    });
};

export const unauthorized = (res: Response) => {
    return res.status(401).json({ error: `You need to be authenticated to access this resource.` });
};
