import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../shared/services/auth-service';
import { LoginForm } from './login';

async function setup() {
    const authService = { login: vi.fn() };
    await TestBed.configureTestingModule({
        imports: [LoginForm],
        providers: [
            provideRouter([]),
            provideLocationMocks(),
            { provide: AuthService, useValue: authService },
        ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance, authService };
}

describe('LoginForm', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('creates and renders the sign-in form', async () => {
        const { fixture } = await setup();
        expect(fixture.nativeElement.textContent).toContain('Sign in to your account');
    });

    it('starts with the password hidden and toggles visibility', async () => {
        const { component } = await setup();
        expect(component.showPassword()).toBe(false);

        component.toggleShowPassword();
        expect(component.showPassword()).toBe(true);

        component.toggleShowPassword();
        expect(component.showPassword()).toBe(false);
    });
});
