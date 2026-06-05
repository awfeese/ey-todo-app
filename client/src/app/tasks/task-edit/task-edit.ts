import { afterNextRender, ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared';
import { Task } from '../shared/models';
import { TaskService } from '../shared/services';
import { taskForm } from '../shared/utils';

const EMPTY_TASK: Task = {
    id: 0,
    task: '',
    completed: false,
    priority: 1
};

@Component({
    selector: 'app-task-edit',
    templateUrl: './task-edit.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MaterialModule, FormRoot, FormField, RouterLink]
})
export class TaskEdit {
    private readonly _taskService = inject(TaskService);

    readonly task = input.required<Task>();
    readonly taskModel = linkedSignal({
        source: this.task,
        computation: value => value || EMPTY_TASK
    });

    readonly taskForm = taskForm(this.taskModel, request => {
        return this._taskService.updateTask(this.task().id, request);
    });

    constructor() {
        afterNextRender(() => {
            this.taskForm.task().focusBoundControl();
        });
    }
}
