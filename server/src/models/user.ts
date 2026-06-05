import { NextFunction, Request, Response } from "express";
import { badRequest } from "../utils/response";

export interface User {
    id: number;
    username: string;
    hashedPassword: Buffer;
    salt: Buffer;
}

export interface Credentials {
    username: string;
    password: string;
}

export const getUserId = (req: Request): number => {
    return req.userId!;
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body as Credentials;
    if (!username || !password) {
        return badRequest(res, 'Username and Password are required.');
    }

    next();
};
