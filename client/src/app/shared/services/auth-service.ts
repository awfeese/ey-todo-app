import { computed, Injectable, signal } from "@angular/core";
import { ApiResponse, BaseService } from "./base-service";
import { tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService extends BaseService {
    private readonly _token = signal('');

    readonly token = this._token.asReadonly();
    readonly isLoggedIn = computed(() => this._token()?.length > 0);

    constructor() {
        super('auth');
    }

    public login(credentials: any) {
        return this._http.post<ApiResponse<any>>(`${this._url}/login`, credentials).pipe(
            tap(response => this._token.set(response.data?.token ?? '')),
            this._handleError()
        );
    }

    public logout() {
        this._token.set('');
    }
}
