import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TaskService } from '../shared/services';
import { TaskAddDialog } from './task-add-dialog';

async function setup() {
    const dialogRef = { close: vi.fn() };
    const taskService = { addTask: vi.fn() };
    await TestBed.configureTestingModule({
        imports: [TaskAddDialog],
        providers: [
            { provide: MatDialogRef, useValue: dialogRef },
            { provide: TaskService, useValue: taskService },
        ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TaskAddDialog);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance, dialogRef, taskService };
}

describe('TaskAddDialog', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('creates and renders the add-task dialog', async () => {
        const { fixture } = await setup();
        expect(fixture.nativeElement.textContent).toContain('Add Task');
    });

    it('initialises with an empty task model', async () => {
        const { component } = await setup();
        expect(component.taskForm.task().value()).toBe('');
    });
});
