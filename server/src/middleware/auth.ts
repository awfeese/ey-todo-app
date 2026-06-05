import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized } from '../utils/response';
import config from '../config';
import { User } from '../models/user';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer')) {
        return unauthorized(res);
    }

    try {
        const token = authHeader.split(' ')[1];
        const user = jwt.verify(token, config.jwt.secret!) as Pick<User, 'id' | 'username'>;
        (req as any).userId = user.id;
    } catch (error) {
        return unauthorized(res);
    }

    next();
};
