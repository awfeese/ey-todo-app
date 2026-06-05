import { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { validateTask } from './task';

function setup(body: unknown) {
    const req = { body } as Request;
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;
    return { req, res, next };
}

describe('validateTask', () => {
    it('calls next for a valid task', () => {
        const { req, res, next } = setup({ task: 'Buy milk' });
        validateTask(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('accepts a task of exactly 50 characters', () => {
        const { req, res, next } = setup({ task: 'a'.repeat(50) });
        validateTask(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('rejects a task longer than 50 characters with 400', () => {
        const { req, res, next } = setup({ task: 'a'.repeat(51) });
        validateTask(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects a missing task with 400 instead of crashing', () => {
        const { req, res, next } = setup({});
        expect(() => validateTask(req, res, next)).not.toThrow();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects an undefined body with 400 instead of crashing', () => {
        const { req, res, next } = setup(undefined);
        expect(() => validateTask(req, res, next)).not.toThrow();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects a non-string task with 400 instead of crashing', () => {
        const { req, res, next } = setup({ task: 12345 });
        expect(() => validateTask(req, res, next)).not.toThrow();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects a null task with 400 instead of crashing', () => {
        const { req, res, next } = setup({ task: null });
        expect(() => validateTask(req, res, next)).not.toThrow();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects an empty or whitespace-only task with 400', () => {
        const { req, res, next } = setup({ task: '   ' });
        validateTask(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });
});
