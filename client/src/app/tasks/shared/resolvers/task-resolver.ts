import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TaskService } from '../services';
import { map } from 'rxjs';

export const taskResolver: ResolveFn<any> = (route) => {
    return inject(TaskService).getTask(route.params['id']).pipe(
        map(response => {
            return response.data || false;
        })
    );
};
