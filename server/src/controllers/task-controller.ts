import { Request, Response } from "express";
import { Task } from "../models/task";
import { getUserId } from "../models/user";
import taskService from "../services/task-service";
import { created, notFound, serverError, success } from "../utils/response";

interface ApiTask {
    id: number;
    task: string;
    completed: boolean;
    priority: number;
}

const toApiModel = (task: Task): ApiTask => {
    return { 
        id: task.id,
        task: task.task,
        completed: task.completed === 1,
        priority: task.priority,
    };
};

const taskController = {
    getTasks: (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const tasks = taskService.getTasks(userId, req.query.searchText as string);
            return success(res, tasks.map(toApiModel));
        } catch (err) {
            return serverError(res, err);
        }
    },

    orderTasks: (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const ordered = taskService.orderTasks(userId, req.body);
            if (!ordered) {
                return notFound(res, 'One or more tasks were not found.');
            }

            const tasks = taskService.getTasks(userId);
            return success(res, tasks.map(toApiModel));
        } catch (err) {
            return serverError(res, err);
        }
    },

    addTask: (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const taskId = taskService.addTask(userId, req.body);
            const task = taskService.getTask(userId, taskId);
            return created(res, toApiModel(task));
        } catch (err) {
            return serverError(res, err);
        }
    },

    getTask: (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const task = taskService.getTask(userId, parseInt(req.params.id as string, 10));
            if (!task) {
                return notFound(res);
            } else {
                return success(res, toApiModel(task));
            }
        } catch (err) {
            return serverError(res, err);
        }
    },

    updateTask: (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const taskId = parseInt(req.params.id as string, 10);

            const updated = taskService.updateTask(userId, taskId, req.body);
            if (!updated) {
                return notFound(res);
            }

            const task = taskService.getTask(userId, taskId);
            return success(res, toApiModel(task));
        } catch (err) {
            return serverError(res, err);
        }
    },

    deleteTask: (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const taskId = parseInt(req.params.id as string, 10);

            const deleted = taskService.deleteTask(userId, taskId);
            if (!deleted) {
                return notFound(res);
            }

            return success(res);
        } catch (err) {
            return serverError(res, err);
        }
    }
};

export default taskController;
