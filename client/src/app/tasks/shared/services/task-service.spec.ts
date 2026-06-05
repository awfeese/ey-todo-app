import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskService } from './task-service';

describe('TaskService', () => {
    let service: TaskService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: MatSnackBar, useValue: { open: vi.fn() } },
            ],
        });
        service = TestBed.inject(TaskService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        TestBed.resetTestingModule();
    });

    it('getTasks issues a GET with no params when no search text is given', () => {
        service.getTasks().subscribe();
        const req = httpMock.expectOne(r => r.url.endsWith('/api/tasks'));
        expect(req.request.method).toBe('GET');
        expect(req.request.params.has('searchText')).toBe(false);
        req.flush({ data: [] });
    });

    it('getTasks passes searchText as a query param', () => {
        service.getTasks('milk').subscribe();
        const req = httpMock.expectOne(r => r.url.endsWith('/api/tasks'));
        expect(req.request.params.get('searchText')).toBe('milk');
        req.flush({ data: [] });
    });

    it('addTask POSTs the request body', () => {
        service.addTask({ task: 'New task' }).subscribe();
        const req = httpMock.expectOne(r => r.url.endsWith('/api/tasks'));
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ task: 'New task' });
        req.flush({ data: { id: 1, task: 'New task', completed: false, priority: 0 } });
    });

    it('getTask GETs a single task by id', () => {
        service.getTask(7).subscribe();
        const req = httpMock.expectOne(r => r.url.endsWith('/api/tasks/7'));
        expect(req.request.method).toBe('GET');
        req.flush({ data: { id: 7, task: 'x', completed: false, priority: 0 } });
    });

    it('updateTask PUTs to the task id with the request body', () => {
        service.updateTask(7, { task: 'Updated', completed: true }).subscribe();
        const req = httpMock.expectOne(r => r.url.endsWith('/api/tasks/7'));
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ task: 'Updated', completed: true });
        req.flush({ data: { id: 7, task: 'Updated', completed: true, priority: 0 } });
    });

    it('deleteTask DELETEs by id and maps the response to { data: true }', () => {
        let result: { data?: boolean } | undefined;
        service.deleteTask(7).subscribe(r => (result = r));
        const req = httpMock.expectOne(r => r.url.endsWith('/api/tasks/7'));
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
        expect(result?.data).toBe(true);
    });

    it('orderTasks PUTs the ordered id list to /order', () => {
        service.orderTasks([3, 1, 2]).subscribe();
        const req = httpMock.expectOne(r => r.url.endsWith('/api/tasks/order'));
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual([3, 1, 2]);
        req.flush({ data: [] });
    });
});
