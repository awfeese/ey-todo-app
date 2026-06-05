import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth-service';

const TOKEN_KEY = 'auth_token';

describe('AuthService', () => {
    let httpMock: HttpTestingController;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: MatSnackBar, useValue: { open: vi.fn() } },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
        TestBed.resetTestingModule();
    });

    function createService() {
        return TestBed.inject(AuthService);
    }

    function login(service: AuthService, token = 'jwt-123') {
        service.login({ username: 'u', password: 'p' }).subscribe();
        httpMock.expectOne(r => r.url.endsWith('/api/auth/login')).flush({ data: { token } });
    }

    it('starts logged out with an empty token', () => {
        const service = createService();
        expect(service.token()).toBe('');
        expect(service.isLoggedIn()).toBe(false);
    });

    it('posts credentials to the login endpoint and stores the returned token', () => {
        const service = createService();
        service.login({ username: 'u', password: 'p' }).subscribe();

        const req = httpMock.expectOne(r => r.url.endsWith('/api/auth/login'));
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username: 'u', password: 'p' });
        req.flush({ data: { token: 'jwt-123' } });

        expect(service.token()).toBe('jwt-123');
        expect(service.isLoggedIn()).toBe(true);
    });

    it('leaves the token empty when the response contains no token', () => {
        const service = createService();
        service.login({ username: 'u', password: 'p' }).subscribe();
        httpMock.expectOne(r => r.url.endsWith('/api/auth/login')).flush({ data: {} });

        expect(service.token()).toBe('');
        expect(service.isLoggedIn()).toBe(false);
    });

    it('persists the token to localStorage on login', () => {
        const service = createService();
        login(service);
        expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-123');
    });

    it('rehydrates the token from localStorage on construction', () => {
        localStorage.setItem(TOKEN_KEY, 'stored-jwt');
        const service = createService();
        expect(service.token()).toBe('stored-jwt');
        expect(service.isLoggedIn()).toBe(true);
    });

    it('logout clears the token from state and localStorage', () => {
        const service = createService();
        login(service);
        expect(service.isLoggedIn()).toBe(true);

        service.logout();
        expect(service.token()).toBe('');
        expect(service.isLoggedIn()).toBe(false);
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('recovers from a login error without storing a token', () => {
        const service = createService();
        let result: unknown;
        service.login({ username: 'u', password: 'p' }).subscribe(r => (result = r));
        httpMock
            .expectOne(r => r.url.endsWith('/api/auth/login'))
            .flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

        expect(service.isLoggedIn()).toBe(false);
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        expect(result).toBeDefined();
    });
});
