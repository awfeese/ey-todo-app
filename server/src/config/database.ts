import { DatabaseSync } from 'node:sqlite';
import config from './index';
import crypto from 'node:crypto';

const connectDB = () => {
    return new DatabaseSync(config.database.path);
};

const initSchema = () => {
    const db = connectDB();

    db.prepare(
        `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        hashed_password BLOB,
        salt BLOB
    );`,
    ).run();

    db.prepare(
        `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task TEXT CHECK(length(task) <= 50) NOT NULL,
        completed BOOLEAN NOT NULL CHECK (completed IN (0, 1)),
        priority INTEGER NOT NULL
    );`,
    ).run();

    const salt = crypto.randomBytes(16);
    db.prepare(
        'INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)',
    ).run('testuser', crypto.pbkdf2Sync('test123!', salt, 310000, 32, 'sha256'), salt);
};

export { initSchema };
export default connectDB;
