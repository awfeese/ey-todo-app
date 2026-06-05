import crypto from 'crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from './app';

const USERNAME = 'testuser';
const PASSWORD = 'test123!';

const db = vi.hoisted(() => {
    const { DatabaseSync } = require('node:sqlite');
    return new DatabaseSync(':memory:');
});

vi.mock('./config/database', () => ({
    default: () => db,
    initSchema: () => {},
}));

function seed() {
    db.exec('DROP TABLE IF EXISTS tasks');
    db.exec('DROP TABLE IF EXISTS users');
    db.exec(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            hashed_password BLOB,
            salt BLOB
        );
        CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            task TEXT CHECK(length(task) <= 50) NOT NULL,
            completed BOOLEAN NOT NULL CHECK (completed IN (0, 1)),
            priority INTEGER NOT NULL
        );
    `);
    const salt = crypto.randomBytes(16);
    const hashed = crypto.pbkdf2Sync(PASSWORD, salt, 310000, 32, 'sha256');
    db.prepare('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)').run(USERNAME, hashed, salt);
}

async function login(username = USERNAME, password = PASSWORD) {
    return request(app).post('/api/auth/login').send({ username, password });
}

async function authToken() {
    const res = await login();
    return res.body.data.token as string;
}

beforeEach(() => seed());

describe('POST /api/auth/login', () => {
    it('returns 200 and a token for valid credentials', async () => {
        const res = await login();
        expect(res.status).toBe(200);
        expect(typeof res.body.data.token).toBe('string');
        expect(res.body.data.token.length).toBeGreaterThan(0);
    });

    it('returns 401 for a wrong password', async () => {
        const res = await login(USERNAME, 'wrong-password');
        expect(res.status).toBe(401);
        expect(res.body.data).toBeUndefined();
    });

    it('returns 401 for an unknown user', async () => {
        const res = await login('nobody', PASSWORD);
        expect(res.status).toBe(401);
    });

    it('returns 400 when the password is missing', async () => {
        const res = await request(app).post('/api/auth/login').send({ username: USERNAME });
        expect(res.status).toBe(400);
    });

    it('returns 400 when the username is missing', async () => {
        const res = await request(app).post('/api/auth/login').send({ password: PASSWORD });
        expect(res.status).toBe(400);
    });
});

describe('authentication guard on /api/tasks', () => {
    it('returns 401 when no Authorization header is present', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.status).toBe(401);
    });

    it('returns 401 for a malformed Authorization header', async () => {
        const res = await request(app).get('/api/tasks').set('Authorization', 'Token abc');
        expect(res.status).toBe(401);
    });

    it('returns 401 for an invalid token', async () => {
        const res = await request(app).get('/api/tasks').set('Authorization', 'Bearer not.a.valid.jwt');
        expect(res.status).toBe(401);
    });

    it('returns 200 with a valid token', async () => {
        const token = await authToken();
        const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });
});

describe('authenticated task lifecycle', () => {
    let token: string;
    const auth = (req: request.Test) => req.set('Authorization', `Bearer ${token}`);

    beforeEach(async () => {
        token = await authToken();
    });

    it('creates, reads, updates, and deletes a task end-to-end', async () => {
        // Create -> 201
        const create = await auth(request(app).post('/api/tasks')).send({ task: 'Write integration tests' });
        expect(create.status).toBe(201);
        const id = create.body.data.id;
        expect(create.body.data).toMatchObject({ task: 'Write integration tests', completed: false });

        // List -> 200, includes the new task
        const list = await auth(request(app).get('/api/tasks'));
        expect(list.status).toBe(200);
        expect(list.body.data).toHaveLength(1);

        // Read by id -> 200
        const read = await auth(request(app).get(`/api/tasks/${id}`));
        expect(read.status).toBe(200);
        expect(read.body.data.id).toBe(id);

        // Update -> 200, reflects change
        const update = await auth(request(app).put(`/api/tasks/${id}`)).send({ task: 'Updated task', completed: true });
        expect(update.status).toBe(200);
        expect(update.body.data).toMatchObject({ task: 'Updated task', completed: true });

        // Delete -> 204
        const remove = await auth(request(app).delete(`/api/tasks/${id}`));
        expect(remove.status).toBe(204);

        // Read after delete -> 404
        const readDeleted = await auth(request(app).get(`/api/tasks/${id}`));
        expect(readDeleted.status).toBe(404);
    });

    it('returns 400 when creating a task with invalid input', async () => {
        const res = await auth(request(app).post('/api/tasks')).send({ task: '' });
        expect(res.status).toBe(400);
    });

    it('returns 404 when updating a task that does not exist', async () => {
        const res = await auth(request(app).put('/api/tasks/99999')).send({ task: 'Nope', completed: false });
        expect(res.status).toBe(404);
    });

    it('returns 404 when deleting a task that does not exist', async () => {
        const res = await auth(request(app).delete('/api/tasks/99999'));
        expect(res.status).toBe(404);
    });

    it('returns 404 when reordering with an unknown task id', async () => {
        const res = await auth(request(app).post('/api/tasks/order')).send([99999]);
        expect(res.status).toBe(404);
    });
});
