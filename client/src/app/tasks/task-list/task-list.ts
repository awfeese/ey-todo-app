import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounce, form, FormField, FormRoot } from '@angular/forms/signals';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from "@angular/router";
import { map } from 'rxjs';
import { MaterialModule } from '../../shared';
import { Task } from '../shared/models';
import { TaskService } from '../shared/services';
import { TaskAddDialog } from '../task-add-dialog/task-add-dialog';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.html',
    styleUrl: './task-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MaterialModule, FormField, FormRoot, RouterLink, CdkDropList, CdkDrag]
})
export class TaskList {
    private readonly _dialog = inject(MatDialog);
    private readonly _taskService = inject(TaskService);
    private readonly _tasks = rxResource({
        params: () => ({ searchText: this.searchForm.searchText().value() }),
        stream: ({ params }) => this._taskService.getTasks(params.searchText).pipe(map(response => response.data ?? []))
    });

    readonly searchModel = signal({ searchText: '' });
    readonly searchForm = form(this.searchModel, root => {
        debounce(root.searchText, 500);
    });

    readonly tasks = computed(() => this._tasks.value());

    public addTask() {
        this._dialog.open(TaskAddDialog, {
            maxWidth: '500px',
            width: '100%'
        })
            .afterClosed()
            .subscribe(newTask => {
                if (newTask) {
                    this._tasks.value.update(value => value!.concat(newTask));
                }
            });
    }

    public updateTask(task: Task, completed: boolean) {
        this._taskService.updateTask(task.id, { task: task.task, completed }).subscribe(response => {
            if (response.data) {
                this._tasks.update(tasks => {
                    const index = tasks?.findIndex(x => x.id === task.id) ?? -1;
                    if (index > -1) {
                        tasks![index] = response.data!;
                        return [...tasks!];
                    } else {
                        return tasks;
                    }
                })
            }
        });
    }

    public deleteTask(task: Task) {
        this._taskService.deleteTask(task.id).subscribe(response => {
            if (response.data) {
                this._tasks.update(tasks => {
                    const index = tasks?.findIndex(x => x.id === task.id) ?? -1;
                    if (index > -1) {
                        tasks!?.splice(index, 1);
                        return [...tasks!];
                    } else {
                        return tasks;
                    }
                })
            }
        });
    }

    public orderTasks(event: CdkDragDrop<Task[]>) {
        const previous = this._tasks.value();
        if (!previous) {
            return;
        }

        const reordered = [...previous];
        moveItemInArray(reordered, event.previousIndex, event.currentIndex);
        this._tasks.set(reordered);

        const request = reordered.map(task => task.id);
        this._taskService.orderTasks(request).subscribe(response => {
            this._tasks.set(response.data ?? [...previous]);
        });
    }
}
