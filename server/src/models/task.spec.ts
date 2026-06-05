import { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { validateTask, validateTaskOrder } from './task';

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

    it('accepts a boolean completed flag', () => {
        for (const completed of [true, false]) {
            const { req, res, next } = setup({ task: 'Buy milk', completed });
            validateTask(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        }
    });

    it('accepts a payload without a completed flag', () => {
        const { req, res, next } = setup({ task: 'Buy milk' });
        validateTask(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('rejects a non-boolean completed flag with 400 instead of coercing it', () => {
        for (const completed of ['false', 1, 0, {}, null]) {
            const { req, res, next } = setup({ task: 'Buy milk', completed });
            validateTask(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        }
    });
});

describe('validateTaskOrder', () => {
    it('calls next for a non-empty array of integer ids', () => {
        const { req, res, next } = setup([3, 1, 2]);
        validateTaskOrder(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects a non-array body with 400 instead of crashing', () => {
        for (const body of [undefined, null, {}, 'abc', 42]) {
            const { req, res, next } = setup(body);
            expect(() => validateTaskOrder(req, res, next)).not.toThrow();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        }
    });

    it('rejects an empty array with 400', () => {
        const { req, res, next } = setup([]);
        validateTaskOrder(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects an array containing non-integer ids with 400', () => {
        for (const id of ['1', 1.5, null, {}, NaN]) {
            const { req, res, next } = setup([1, id]);
            validateTaskOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        }
    });
});
