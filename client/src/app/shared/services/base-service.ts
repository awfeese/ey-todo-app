import { Location } from "@angular/common";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Inject, inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { catchError, MonoTypeOperatorFunction, of } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
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
                    const message = res.error?.error || `The requested action can't be completed due to an unexpected issue.`;
                    this._toastMessage(message);
                    return of<ApiResponse<T>>({ error: message });
                })
            );
    }

    protected _toastMessage(message: string): void {
        this._snackBar.open(message, '', { duration: 2500 });
    }
}
