import { afterNextRender, ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared';
import { Task, TaskRequest } from '../shared/models';
import { TaskService } from '../shared/services';
import { taskForm } from '../shared/utils';
import { tap } from 'rxjs';

const EMPTY_TASK: TaskRequest = {
    task: '',
    completed: false
};

@Component({
    selector: 'app-task-edit',
    templateUrl: './task-edit.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MaterialModule, FormRoot, FormField, RouterLink]
})
export class TaskEdit {
    private readonly _router = inject(Router);
    private readonly _taskService = inject(TaskService);

    readonly task = input.required<Task>();
    readonly taskModel = linkedSignal<Task, TaskRequest>({
        source: this.task,
        computation: value => value || EMPTY_TASK
    });

    readonly taskForm = taskForm(this.taskModel, request => {
        return this._taskService.updateTask(this.task().id, request).pipe(
            tap(response => {
                if (response.data) {
                    this._router.navigateByUrl('/tasks');
                }
            })
        );
    });

    constructor() {
        afterNextRender(() => {
            this.taskForm.task().focusBoundControl();
        });
    }
}
