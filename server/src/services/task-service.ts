import { SQLInputValue } from 'node:sqlite';
import db from '../config/database';
import { AddTaskRequest, Task, UpdateTaskRequest } from '../models/task';

const getNextPriority = (userId: number) => {
    const query = db.prepare('SELECT MAX(priority) AS priority FROM tasks WHERE user_id = ?');
    const { priority } = query.get(userId) as Pick<Task, 'priority'>;
    return priority == null ? 0 : priority + 1;
};

// A reorder must be a complete permutation of the user's task ids: same length,
// every id owned by the user, and no duplicates. This prevents a partial list
// from leaving omitted tasks with colliding priorities.
const isCompleteOrdering = (provided: number[], existing: number[]): boolean => {
    if (provided.length !== existing.length) {
        return false;
    }

    const existingIds = new Set(existing);
    const seen = new Set<number>();
    for (const id of provided) {
        if (!existingIds.has(id) || seen.has(id)) {
            return false;
        }
        seen.add(id);
    }

    return true;
};

const taskService = {
    getTasks: (userId: number, searchText?: string): Task[] => {
        const params: SQLInputValue[] = [userId];

        let sql = 'SELECT * FROM tasks WHERE user_id = ?';
        if (searchText && searchText.length > 0) {
            sql += ' AND task LIKE ?';
            params.push(`%${searchText}%`);
        }
        sql += ' ORDER BY priority';

        const result = db.prepare(sql).all(...params) as unknown as Task[];
        return result;
    },

    orderTasks: (userId: number, taskIds: number[]): boolean => {
        const existingIds = (
            db.prepare('SELECT id FROM tasks WHERE user_id = ?').all(userId) as unknown as Pick<Task, 'id'>[]
        ).map(row => row.id);

        if (!isCompleteOrdering(taskIds, existingIds)) {
            return false;
        }

        try {
            db.exec('BEGIN TRANSACTION');

            const update = db.prepare('UPDATE tasks SET priority = ? WHERE user_id = ? AND id = ?');
            taskIds.forEach((taskId, priority) => update.run(priority, userId, taskId));

            db.exec('COMMIT');
            return true;
        } catch (error) {
            db.exec('ROLLBACK');
            return false;
        }
    },

    addTask: (userId: number, req: AddTaskRequest): number => {
        const priority = getNextPriority(userId);
        const query = db.prepare(`INSERT INTO tasks (user_id, task, completed, priority)
            VALUES (?,?,?,?)
            RETURNING id
        `);

        const result = query.get(userId, req.task, 0, priority) as Pick<Task, 'id'>;
        return result.id;
    },

    getTask: (userId: number, id: number): Task | undefined => {
        const query = db.prepare('SELECT * FROM tasks WHERE user_id = ? AND id = ?');
        const result = query.get(userId, id) as Task | undefined;
        return result;
    },

    updateTask: (userId: number, id: number, req: UpdateTaskRequest): boolean => {
        const query = db.prepare('UPDATE tasks SET task = ?, completed = ? WHERE user_id = ? AND id = ?');
        const result = query.run(req.task, req.completed ? 1 : 0, userId, id);
        return result.changes === 1;
    },

    deleteTask: (userId: number, id: number): boolean => {
        const query = db.prepare('DELETE FROM tasks WHERE user_id = ? AND id = ?');
        const result = query.run(userId, id);
        return result.changes === 1;
    },
};

export default taskService;
