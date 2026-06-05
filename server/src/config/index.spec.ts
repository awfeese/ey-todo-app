import { describe, expect, it } from 'vitest';
import config, { assertRequiredConfig } from './index';

describe('assertRequiredConfig', () => {
    it('does not throw when JWT_SECRET is set', () => {
        expect(() => assertRequiredConfig()).not.toThrow();
    });

    it('throws a clear error when JWT_SECRET is missing', () => {
        const original = config.jwt.secret;
        config.jwt.secret = undefined;
        try {
            expect(() => assertRequiredConfig()).toThrow(/JWT_SECRET/);
        } finally {
            config.jwt.secret = original;
        }
    });
});
