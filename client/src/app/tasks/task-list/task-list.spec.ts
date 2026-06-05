import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Task } from '../shared/models';
import { TaskService } from '../shared/services';
import { TaskList } from './task-list';

const TASKS: Task[] = [
    { id: 1, task: 'Buy milk', completed: false, priority: 0 },
    { id: 2, task: 'Walk the dog', completed: false, priority: 1 },
    { id: 3, task: 'Read a book', completed: true, priority: 2 },
];

function makeTaskService(overrides: Partial<Record<keyof TaskService, unknown>> = {}) {
    return {
        getTasks: vi.fn().mockReturnValue(of({ data: [...TASKS] })),
        updateTask: vi.fn().mockReturnValue(of({ data: { ...TASKS[0], completed: true } })),
        deleteTask: vi.fn().mockReturnValue(of({ data: true })),
        orderTasks: vi.fn().mockReturnValue(of({ data: [...TASKS] })),
        ...overrides,
    };
}

async function setup(taskServiceOverrides: Partial<Record<keyof TaskService, unknown>> = {}) {
    const taskService = makeTaskService(taskServiceOverrides);

    await TestBed.configureTestingModule({
        imports: [TaskList],
        providers: [
            provideRouter([]),
            provideLocationMocks(),
            { provide: TaskService, useValue: taskService },
        ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TaskList);

    // Spy on the MatDialog instance from the component's own injector so the
    // mock intercepts the inject(MatDialog) call inside the standalone component.
    const dialogAfterClosed$ = new Subject<Task | undefined>();
    const matDialog = fixture.debugElement.injector.get(MatDialog);
    const openSpy = vi.spyOn(matDialog, 'open').mockReturnValue({
        afterClosed: () => dialogAfterClosed$,
    } as unknown as ReturnType<MatDialog['open']>);

    fixture.detectChanges();
    await fixture.whenStable();

    return {
        fixture,
        component: fixture.componentInstance,
        taskService,
        dialog: { open: openSpy },
        dialogAfterClosed$,
    };
}

afterEach(() => TestBed.resetTestingModule());

describe('TaskList', () => {
    describe('initial load', () => {
        it('calls getTasks on init', async () => {
            const { taskService } = await setup();
            expect(taskService.getTasks).toHaveBeenCalledTimes(1);
        });

        it('renders a list item for each task', async () => {
            const { fixture } = await setup();
            const items = fixture.nativeElement.querySelectorAll('[role="listitem"]');
            expect(items.length).toBe(TASKS.length);
        });

        it('displays task text in the list', async () => {
            const { fixture } = await setup();
            const text = fixture.nativeElement.textContent;
            expect(text).toContain('Buy milk');
            expect(text).toContain('Walk the dog');
            expect(text).toContain('Read a book');
        });

        it('shows empty-state message when no tasks exist', async () => {
            const { fixture } = await setup({
                getTasks: vi.fn().mockReturnValue(of({ data: [] })),
            });
            expect(fixture.nativeElement.textContent).toContain('You have not created any tasks yet.');
        });
    });

    describe('search', () => {
        it('calls getTasks with search text when the search model changes', async () => {
            const { fixture, component, taskService } = await setup();

            component.searchModel.update(m => ({ ...m, searchText: 'milk' }));
            fixture.detectChanges();
            await fixture.whenStable();

            expect(taskService.getTasks).toHaveBeenCalledWith('milk');
        });

        it('shows no-match message when search has a value but returns empty', async () => {
            const { fixture, component } = await setup({
                getTasks: vi.fn().mockReturnValue(of({ data: [] })),
            });
            component.searchModel.update(m => ({ ...m, searchText: 'xyz' }));
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.nativeElement.textContent).toContain('There were no matching tasks found.');
        });
    });

    describe('addTask', () => {
        it('opens the add-task dialog', async () => {
            const { component, dialog } = await setup();
            component.addTask();
            expect(dialog.open).toHaveBeenCalled();
        });

        it('appends the new task to the list when dialog closes with a task', async () => {
            const { component, fixture, dialogAfterClosed$ } = await setup();
            component.addTask();

            const newTask: Task = { id: 99, task: 'New task', completed: false, priority: 3 };
            dialogAfterClosed$.next(newTask);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.nativeElement.textContent).toContain('New task');
        });

        it('does not change the list when dialog is dismissed', async () => {
            const { component, fixture, dialogAfterClosed$ } = await setup();
            component.addTask();

            dialogAfterClosed$.next(undefined);
            fixture.detectChanges();
            await fixture.whenStable();

            const items = fixture.nativeElement.querySelectorAll('[role="listitem"]');
            expect(items.length).toBe(TASKS.length);
        });
    });

    describe('updateTask', () => {
        it('calls updateTask on the service with the new completed status', async () => {
            const { component, taskService } = await setup();
            component.updateTask(TASKS[0], true);
            expect(taskService.updateTask).toHaveBeenCalledWith(TASKS[0].id, { task: TASKS[0].task, completed: true });
        });

        it('replaces the task in the list with the response value', async () => {
            const updated: Task = { ...TASKS[0], completed: true };
            const { component, fixture } = await setup({
                updateTask: vi.fn().mockReturnValue(of({ data: updated })),
            });

            component.updateTask(TASKS[0], true);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.tasks()?.find(t => t.id === TASKS[0].id)?.completed).toBe(true);
        });
    });

    describe('deleteTask', () => {
        it('calls deleteTask on the service with the task id', async () => {
            const { component, taskService } = await setup();
            component.deleteTask(TASKS[1]);
            expect(taskService.deleteTask).toHaveBeenCalledWith(TASKS[1].id);
        });

        it('removes the task from the list on success', async () => {
            const { component, fixture } = await setup();
            component.deleteTask(TASKS[1]);
            fixture.detectChanges();
            await fixture.whenStable();

            const items = fixture.nativeElement.querySelectorAll('[role="listitem"]');
            expect(items.length).toBe(TASKS.length - 1);
            expect(fixture.nativeElement.textContent).not.toContain('Walk the dog');
        });
    });

    describe('orderTasks', () => {
        it('calls orderTasks on the service with reordered ids', async () => {
            const { component, taskService } = await setup();
            const event = { previousIndex: 0, currentIndex: 2 } as CdkDragDrop<Task[]>;
            component.orderTasks(event);
            expect(taskService.orderTasks).toHaveBeenCalled();
        });

        it('updates the task list with the response from the service', async () => {
            const reordered = [TASKS[2], TASKS[1], TASKS[0]];
            const { component, fixture } = await setup({
                orderTasks: vi.fn().mockReturnValue(of({ data: reordered })),
            });

            const event = { previousIndex: 0, currentIndex: 2 } as CdkDragDrop<Task[]>;
            component.orderTasks(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.tasks()?.[0].id).toBe(TASKS[2].id);
        });

        it('rolls back to the previous order when the reorder fails', async () => {
            const { component, fixture } = await setup({
                orderTasks: vi.fn().mockReturnValue(of({ error: 'nope' })),
            });
            const before = component.tasks()!.map(t => t.id);

            const event = { previousIndex: 0, currentIndex: 2 } as CdkDragDrop<Task[]>;
            component.orderTasks(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.tasks()!.map(t => t.id)).toEqual(before);
        });
    });
});
