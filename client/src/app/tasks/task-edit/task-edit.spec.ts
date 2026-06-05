import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Task } from '../shared/models';
import { TaskService } from '../shared/services';
import { TaskEdit } from './task-edit';

const TASK: Task = { id: 5, task: 'Existing task', completed: false, priority: 1 };

async function setup(task: Task = TASK) {
    const taskService = { updateTask: vi.fn() };
    await TestBed.configureTestingModule({
        imports: [TaskEdit],
        providers: [
            provideRouter([]),
            provideLocationMocks(),
            { provide: TaskService, useValue: taskService },
        ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TaskEdit);
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance, taskService };
}

describe('TaskEdit', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('creates and seeds the form with the resolved task', async () => {
        const { component } = await setup();
        expect(component.task().id).toBe(5);
        expect(component.taskForm.task().value()).toBe('Existing task');
    });

    it('renders the task text into the textarea', async () => {
        const { fixture } = await setup();
        const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
        expect(textarea.value).toBe('Existing task');
    });
});
