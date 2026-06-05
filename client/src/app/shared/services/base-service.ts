import { Location } from "@angular/common";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Inject, inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { catchError, MonoTypeOperatorFunction, of } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

@Injectable()
export abstract class BaseService {
    private readonly _snackBar = inject(MatSnackBar);
    protected readonly _http = inject(HttpClient);
    protected readonly _url: string;

    constructor(@Inject(String) resource: string) {
        this._url = Location.joinWithSlash(environment.apiUrl, resource.length > 0 ? `/api/${resource}` : '/api');
    }

    protected _handleError<T>(): MonoTypeOperatorFunction<ApiResponse<T>> {
        return response$ =>
            response$.pipe(
                catchError((res: HttpErrorResponse) => {
                    this._toastMessage(res.error?.error || `The requested action can't be completed due to an unexpected issue.`);
                    return of(res);
                })
            );
    }

    protected _toastMessage(message: string): void {
        this._snackBar.open(message, '', { duration: 2500 });
    }
}
