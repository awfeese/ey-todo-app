import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { MatDialogRef } from '@angular/material/dialog';
import { tap } from 'rxjs';
import { MaterialModule } from '../../shared';
import { TaskService } from '../shared/services';
import { taskForm } from '../shared/utils';
import { TaskRequest } from '../shared/models';

@Component({
    selector: 'app-task-add-dialog',
    templateUrl: './task-add-dialog.html',
    styleUrl: './task-add-dialog.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MaterialModule, FormRoot, FormField],
})
export class TaskAddDialog {
    private readonly _dialogRef = inject(MatDialogRef);
    private readonly _taskService = inject(TaskService);

    readonly taskModel = signal<TaskRequest>({ task: '', completed: false });
    readonly taskForm = taskForm(this.taskModel, request => {
        return this._taskService.addTask(request).pipe(
            tap(response => {
                if (response.data) {
                    this._dialogRef.close(response.data);
                }
            })
        );
    });
}
