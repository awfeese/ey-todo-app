import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { ApiResponse, BaseService } from '../../../shared/services';
import { Task, TaskRequest } from '../models';

@Injectable({
    providedIn: 'root',
})
export class TaskService extends BaseService {
    constructor() {
        super('tasks');
    }

    public getTasks(searchText?: string) {
        let params: HttpParams | undefined = undefined;
        if (searchText) {
            params = new HttpParams().set('searchText', searchText!);
        }

        return this._http.get<ApiResponse<Task[]>>(this._url, { params }).pipe(
            this._handleError()
        );
    }

    public orderTasks(request: number[]) {
        return this._http.put<ApiResponse<Task[]>>(`${this._url}/order`, request).pipe(
            tap(() => this._toastMessage('Successfully updated the order of your tasks!')),
            this._handleError()
        );
    }

    public addTask(request: TaskRequest) {
        return this._http.post<ApiResponse<Task>>(this._url, request).pipe(
            tap(() => this._toastMessage('Successfully created task!')),
            this._handleError()
        );
    }

    public getTask(id: number) {
        return this._http.get<ApiResponse<Task>>(`${this._url}/${id}`).pipe(
            this._handleError()
        );
    }

    public updateTask(id: number, request: TaskRequest) {
        return this._http.put<ApiResponse<Task>>(`${this._url}/${id}`, request).pipe(
            tap(() => this._toastMessage('Successfully updated task!')),
            this._handleError()
        );
    }

    public deleteTask(id: number) {
        return this._http.delete<ApiResponse<void>>(`${this._url}/${id}`).pipe(
            map(() => {
                this._toastMessage('Successfully deleted task!');
                return { data: true };
            }),
            this._handleError()
        );
    }
}
