import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config';
import database from '../config/database';
import { Credentials, User } from '../models/user';

const db = database();

const userService = {
    login: (creds: Credentials): string | null => {
        const sql = 'SELECT id, username, hashed_password AS hashedPassword, salt FROM users WHERE username = ?';
        const result = db.prepare(sql).get(creds.username) as User | undefined;

        if (!result) {
            return null;
        }

        const derived = crypto.pbkdf2Sync(creds.password, result.salt, 310000, 32, 'sha256');
        if (!crypto.timingSafeEqual(derived, result.hashedPassword)) {
            return null;
        }

        return jwt.sign(
            { id: result.id, username: result.username },
            config.jwt.secret!,
            { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] },
        );
    }
};

export default userService;
