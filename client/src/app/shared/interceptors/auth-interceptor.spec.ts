import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../services/auth-service';
import { authInterceptor } from './auth-interceptor';

function setup(token: string) {
    const logout = vi.fn();
    TestBed.configureTestingModule({
        providers: [
            provideHttpClient(withInterceptors([authInterceptor])),
            provideHttpClientTesting(),
            { provide: AuthService, useValue: { token: () => token, logout } },
        ],
    });
    return {
        http: TestBed.inject(HttpClient),
        httpMock: TestBed.inject(HttpTestingController),
        logout,
    };
}

describe('authInterceptor', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('attaches a Bearer token when one is present', () => {
        const { http, httpMock } = setup('jwt-123');
        http.get('/api/tasks').subscribe();

        const req = httpMock.expectOne('/api/tasks');
        expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-123');
        req.flush({});
        httpMock.verify();
    });

    it('does not attach an Authorization header when there is no token', () => {
        const { http, httpMock } = setup('');
        http.get('/api/tasks').subscribe();

        const req = httpMock.expectOne('/api/tasks');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
        httpMock.verify();
    });

    it('calls logout on a 401 response', () => {
        const { http, httpMock, logout } = setup('jwt-123');
        http.get('/api/tasks').subscribe({ next: () => {}, error: () => {} });

        httpMock.expectOne('/api/tasks').flush({}, { status: 401, statusText: 'Unauthorized' });
        expect(logout).toHaveBeenCalledTimes(1);
        httpMock.verify();
    });

    it('does not call logout on non-401 errors', () => {
        const { http, httpMock, logout } = setup('jwt-123');
        http.get('/api/tasks').subscribe({ next: () => {}, error: () => {} });

        httpMock.expectOne('/api/tasks').flush({}, { status: 500, statusText: 'Server Error' });
        expect(logout).not.toHaveBeenCalled();
        httpMock.verify();
    });
});
