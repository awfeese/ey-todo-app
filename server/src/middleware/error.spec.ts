import { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { errorHandler, notFoundHandler } from './error';

function setup(headersSent = false) {
    const req = {} as Request;
    const res = {
        headersSent,
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;
    return { req, res, next };
}

describe('notFoundHandler', () => {
    it('responds with a 404 JSON envelope', () => {
        const { req, res } = setup();
        notFoundHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
});

describe('errorHandler', () => {
    it('maps a malformed-JSON SyntaxError to a 400 envelope', () => {
        const { req, res, next } = setup();
        const err = Object.assign(new SyntaxError('Unexpected token'), { body: '{ bad' });
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('maps an unexpected error to a 500 envelope', () => {
        const { req, res, next } = setup();
        errorHandler(new Error('boom'), req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });

    it('delegates to the default handler when headers are already sent', () => {
        const { req, res, next } = setup(true);
        const err = new Error('boom');
        errorHandler(err, req, res, next);
        expect(next).toHaveBeenCalledWith(err);
        expect(res.status).not.toHaveBeenCalled();
    });
});
