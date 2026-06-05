export interface Task {
    id: number;
    task: string;
    completed: boolean;
    priority: number;
}

export type TaskRequest = Pick<Task, 'task' | 'completed'>;
