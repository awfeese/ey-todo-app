import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.spec.ts'],
        env: {
            JWT_SECRET: 'test-secret',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.spec.ts', 'src/server.ts', 'src/config/database.ts', 'src/config/logger.ts'],
        },
    },
});
