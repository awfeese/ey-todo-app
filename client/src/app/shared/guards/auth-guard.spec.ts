import { TestBed } from '@angular/core/testing';
import { RedirectCommand, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthService } from '../services/auth-service';
import { authGuard } from './auth-guard';

function setup(isLoggedIn: boolean) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            { provide: AuthService, useValue: { isLoggedIn: () => isLoggedIn } },
        ],
    });
}

function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
}

describe('authGuard', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('allows activation when the user is logged in', () => {
        setup(true);
        expect(runGuard()).toBe(true);
    });

    it('redirects to /login when the user is not logged in', () => {
        setup(false);
        const result = runGuard();
        expect(result).toBeInstanceOf(RedirectCommand);
        expect((result as RedirectCommand).redirectTo.toString()).toBe('/login');
    });
});
