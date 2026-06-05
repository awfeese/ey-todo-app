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
    const { task } = req.body as TaskRequest;
    if (task.length > 50) {
        return badRequest(res, 'Task must be less than 50 characters.');
    }

    next();
};
