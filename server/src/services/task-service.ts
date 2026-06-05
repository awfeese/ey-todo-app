import { SQLInputValue } from 'node:sqlite';
import database from '../config/database';
import { Task, TaskRequest } from '../models/task';

const db = database();

const getNextPriority = (userId: number) => {
    const query = db.prepare('SELECT MAX(priority) AS priority FROM tasks WHERE user_id = ?');
    const { priority } = query.get(userId) as Pick<Task, 'priority'>;
    return priority == null || isNaN(priority) ? 0 : priority + 1;
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

    orderTasks: (userId: number, taskIds: number[]) => {
        try {
            db.exec('BEGIN TRANSACTION');

            for (let priority = 0; priority < taskIds.length; priority++) {
                const taskId = taskIds[priority];
                const query = db.prepare('UPDATE tasks SET priority = ? WHERE user_id = ? AND id = ?');
                const result = query.run(priority, userId, taskId);
                if (result.changes !== 1) {
                    throw new Error(`An error while attempting to update task ${taskId}`);
                }
            }

            db.exec('COMMIT');
            return true;
        } catch (error) {
            db.exec('ROLLBACK');
            return false;
        }
    },

    addTask: (userId: number, req: TaskRequest): number => {
        const priority = getNextPriority(userId);
        const query = db.prepare(`INSERT INTO tasks (user_id, task, completed, priority)
            VALUES (?,?,?,?)
            RETURNING id
        `);

        const result = query.get(userId, req.task, 0, priority) as Pick<Task, 'id'>;
        return result.id;
    },

    getTask: (userId: number, id: number): Task => {
        const query = db.prepare('SELECT * FROM tasks WHERE user_id = ? AND id = ?');
        const result = query.get(userId, id) as unknown as Task;
        return result;
    },

    updateTask: (userId: number, id: number, req: TaskRequest): boolean => {
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
