import { NextFunction, Request, Response } from "express";
import { badRequest } from "../utils/response";

export interface Task {
    id: number;
    user_id: number;
    task: string;
    completed: number;
    priority: number;
}

export type TaskRequest = Pick<Task, 'task'> & { completed: boolean };

export const validateTask = (req: Request, res: Response, next: NextFunction) => {
    const { task, completed } = (req.body ?? {}) as Partial<TaskRequest>;

    if (typeof task !== 'string' || task.trim().length === 0) {
        return badRequest(res, 'Task is required.');
    }

    if (task.length > 50) {
        return badRequest(res, 'Task must be 50 characters or fewer.');
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
        return badRequest(res, 'Completed must be a boolean.');
    }

    next();
};

export const validateTaskOrder = (req: Request, res: Response, next: NextFunction) => {
    const taskIds = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return badRequest(res, 'A non-empty array of task ids is required.');
    }

    if (!taskIds.every(id => Number.isInteger(id))) {
        return badRequest(res, 'Task ids must be integers.');
    }

    next();
};
