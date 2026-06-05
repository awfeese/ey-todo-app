import { computed, Injectable, signal } from "@angular/core";
import { ApiResponse, BaseService } from "./base-service";
import { tap } from "rxjs";

const TOKEN_KEY = 'auth_token';

export interface Credentials {
    username: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService extends BaseService {
    private readonly _token = signal(localStorage.getItem(TOKEN_KEY) ?? '');

    readonly token = this._token.asReadonly();
    readonly isLoggedIn = computed(() => this._token().length > 0);

    constructor() {
        super('auth');
    }

    public login(credentials: Credentials) {
        return this._http.post<ApiResponse<{ token: string }>>(`${this._url}/login`, credentials).pipe(
            tap(response => this._setToken(response.data?.token ?? '')),
            this._handleError()
        );
    }

    public logout() {
        this._setToken('');
    }

    private _setToken(token: string): void {
        this._token.set(token);
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }
}
