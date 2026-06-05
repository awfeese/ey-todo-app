import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Task } from '../models';
import { TaskService } from '../services';


export const taskResolver: ResolveFn<Task | RedirectCommand> = (route) => {
    const taskService = inject(TaskService);
    const router = inject(Router);

    const taskId = Number(route.params['id']);
    const redirectToTasks = new RedirectCommand(router.parseUrl('/tasks'));

    if (isNaN(taskId)) {
        return redirectToTasks;
    } else {
        return taskService.getTask(taskId).pipe(
            map(response => {
                if (response.data) {
                    return response.data;
                } else {
                    return redirectToTasks;
                }
            }),
        );
    }
};
