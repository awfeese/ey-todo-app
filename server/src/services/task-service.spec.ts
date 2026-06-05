import { beforeEach, describe, expect, it, vi } from 'vitest';
import taskService from './task-service';

const db = vi.hoisted(() => {
    const { DatabaseSync } = require('node:sqlite');
    const instance = new DatabaseSync(':memory:');
    instance.exec(`
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
        INSERT INTO users (id, username) VALUES (1, 'alice'), (2, 'bob');
    `);
    return instance;
});

vi.mock('../config/database', () => ({ default: db }));

const USER = 1;
const OTHER_USER = 2;

const seed = (...tasks: string[]) =>
    tasks.map((task, i) =>
        taskService.addTask(USER, { task }),
    );

beforeEach(() => {
    db.exec('DELETE FROM tasks');
});

describe('addTask', () => {
    it('creates a task and returns its id', () => {
        const id = taskService.addTask(USER, { task: 'buy milk' });
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThan(0);
    });

    it('assigns incrementing priorities', () => {
        const [id1, id2] = seed('first', 'second');
        const tasks = taskService.getTasks(USER);
        expect(tasks[0].priority).toBe(0);
        expect(tasks[1].priority).toBe(1);
    });
});

describe('getTasks', () => {
    it('returns all tasks for the user ordered by priority', () => {
        seed('a', 'b', 'c');
        const tasks = taskService.getTasks(USER);
        expect(tasks).toHaveLength(3);
        expect(tasks.map(t => t.task)).toEqual(['a', 'b', 'c']);
    });

    it('does not return tasks belonging to another user', () => {
        taskService.addTask(OTHER_USER, { task: 'other task' });
        expect(taskService.getTasks(USER)).toHaveLength(0);
    });

    it('filters by searchText (case-insensitive partial match)', () => {
        seed('buy milk', 'walk the dog', 'buy bread');
        const results = taskService.getTasks(USER, 'buy');
        expect(results).toHaveLength(2);
        expect(results.every(t => t.task.includes('buy'))).toBe(true);
    });

    it('returns empty array when searchText matches nothing', () => {
        seed('task one');
        expect(taskService.getTasks(USER, 'xyz')).toHaveLength(0);
    });

    it('returns all tasks when searchText is empty string', () => {
        seed('a', 'b');
        expect(taskService.getTasks(USER, '')).toHaveLength(2);
    });
});

describe('getTask', () => {
    it('returns the task by id for the correct user', () => {
        const id = taskService.addTask(USER, { task: 'hello' });
        const task = taskService.getTask(USER, id);
        expect(task).toBeDefined();
        expect(task!.id).toBe(id);
        expect(task!.task).toBe('hello');
        expect(task!.completed).toBeFalsy();
    });

    it('returns undefined for a task owned by another user', () => {
        const id = taskService.addTask(OTHER_USER, { task: 'secret' });
        expect(taskService.getTask(USER, id)).toBeUndefined();
    });

    it('returns undefined for a non-existent id', () => {
        expect(taskService.getTask(USER, 99999)).toBeUndefined();
    });
});

describe('updateTask', () => {
    it('updates task text and completed status', () => {
        const id = taskService.addTask(USER, { task: 'old text' });
        const ok = taskService.updateTask(USER, id, { task: 'new text', completed: true });
        expect(ok).toBe(true);
        const task = taskService.getTask(USER, id);
        expect(task).toBeDefined();
        expect(task!.task).toBe('new text');
        expect(task!.completed).toBeTruthy();
    });

    it('returns false when task does not exist', () => {
        expect(taskService.updateTask(USER, 99999, { task: 'x', completed: false })).toBe(false);
    });

    it('returns false when task belongs to another user', () => {
        const id = taskService.addTask(OTHER_USER, { task: 'theirs' });
        expect(taskService.updateTask(USER, id, { task: 'mine', completed: false })).toBe(false);
    });
});

describe('deleteTask', () => {
    it('deletes an existing task and returns true', () => {
        const id = taskService.addTask(USER, { task: 'remove me' });
        expect(taskService.deleteTask(USER, id)).toBe(true);
        expect(taskService.getTask(USER, id)).toBeUndefined();
    });

    it('returns false for a non-existent id', () => {
        expect(taskService.deleteTask(USER, 99999)).toBe(false);
    });

    it('returns false when task belongs to another user', () => {
        const id = taskService.addTask(OTHER_USER, { task: 'theirs' });
        expect(taskService.deleteTask(USER, id)).toBe(false);
    });
});

describe('orderTasks', () => {
    it('reorders tasks by updating their priorities', () => {
        seed('first', 'second', 'third');
        const tasks = taskService.getTasks(USER);
        const reversed = [...tasks].reverse().map(t => t.id);
        expect(taskService.orderTasks(USER, reversed)).toBe(true);
        const reordered = taskService.getTasks(USER);
        expect(reordered[0].task).toBe('third');
        expect(reordered[1].task).toBe('second');
        expect(reordered[2].task).toBe('first');
    });

    it('returns false when a task id does not belong to the user', () => {
        seed('mine');
        const otherId = taskService.addTask(OTHER_USER, { task: 'theirs' });
        const myTasks = taskService.getTasks(USER);
        expect(taskService.orderTasks(USER, [myTasks[0].id, otherId])).toBe(false);
    });

    it('returns false when the list omits some of the user\'s tasks', () => {
        const [first] = seed('first', 'second', 'third');
        expect(taskService.orderTasks(USER, [first])).toBe(false);
    });

    it('returns false when the list contains duplicate ids', () => {
        const [first] = seed('first', 'second');
        expect(taskService.orderTasks(USER, [first, first])).toBe(false);
    });
});
