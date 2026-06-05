import { NextFunction, Request, Response } from "express";
import { badRequest } from "../utils/response";

export interface Task {
    id: number;
    user_id: number;
    task: string;
    completed: number;
    priority: number;
}

export type AddTaskRequest = Pick<Task, 'task'>;
export type UpdateTaskRequest = AddTaskRequest & { completed: boolean };

export const validateTask = (req: Request, res: Response, next: NextFunction) => {
    const { task } = (req.body ?? {}) as Partial<AddTaskRequest>;

    if (typeof task !== 'string' || task.trim().length === 0) {
        return badRequest(res, 'Task is required.');
    }

    if (task.length > 50) {
        return badRequest(res, 'Task must be 50 characters or fewer.');
    }

    next();
};

export const validateTaskUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { completed } = (req.body ?? {}) as Partial<UpdateTaskRequest>;

    if (typeof completed !== 'boolean') {
        return badRequest(res, 'Completed must be a boolean.');
    }

    validateTask(req, res, next);
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
