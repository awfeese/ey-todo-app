export interface Task {
    id: number;
    task: string;
    completed: boolean;
    priority: number;
}

export type TaskRequest = Required<Pick<Task, 'task'>> & Partial<Pick<Task, 'completed'>>;
