import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth-service';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: MatSnackBar, useValue: { open: vi.fn() } },
            ],
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        TestBed.resetTestingModule();
    });

    it('starts logged out with an empty token', () => {
        expect(service.token()).toBe('');
        expect(service.isLoggedIn()).toBe(false);
    });

    it('posts credentials to the login endpoint and stores the returned token', () => {
        service.login({ username: 'u', password: 'p' }).subscribe();

        const req = httpMock.expectOne(r => r.url.endsWith('/api/auth/login'));
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username: 'u', password: 'p' });
        req.flush({ data: { token: 'jwt-123' } });

        expect(service.token()).toBe('jwt-123');
        expect(service.isLoggedIn()).toBe(true);
    });

    it('leaves the token empty when the response contains no token', () => {
        service.login({ username: 'u', password: 'p' }).subscribe();
        httpMock.expectOne(r => r.url.endsWith('/api/auth/login')).flush({ data: {} });

        expect(service.token()).toBe('');
        expect(service.isLoggedIn()).toBe(false);
    });

    it('logout clears the token', () => {
        service.login({ username: 'u', password: 'p' }).subscribe();
        httpMock.expectOne(r => r.url.endsWith('/api/auth/login')).flush({ data: { token: 'jwt-123' } });
        expect(service.isLoggedIn()).toBe(true);

        service.logout();
        expect(service.token()).toBe('');
        expect(service.isLoggedIn()).toBe(false);
    });

    it('recovers from a login error without setting a token', () => {
        let result: unknown;
        service.login({ username: 'u', password: 'p' }).subscribe(r => (result = r));
        httpMock
            .expectOne(r => r.url.endsWith('/api/auth/login'))
            .flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

        expect(service.isLoggedIn()).toBe(false);
        expect(result).toBeDefined();
    });
});
