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
    const { task } = (req.body ?? {}) as Partial<TaskRequest>;

    if (typeof task !== 'string' || task.trim().length === 0) {
        return badRequest(res, 'Task is required.');
    }

    if (task.length > 50) {
        return badRequest(res, 'Task must be 50 characters or fewer.');
    }

    next();
};
