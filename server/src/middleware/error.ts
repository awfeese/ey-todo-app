import { NextFunction, Request, Response } from 'express';
import { badRequest, notFound, serverError } from '../utils/response';

export const notFoundHandler = (_req: Request, res: Response) => {
    return notFound(res);
};

export const errorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && 'body' in err) {
        return badRequest(res, 'Request body must be valid JSON.');
    }

    return serverError(res, err);
};
