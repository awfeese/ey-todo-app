import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MaterialModule } from '../shared';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { AuthService } from '../shared/services/auth-service';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './login.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MaterialModule, FormRoot, FormField],
})
export class LoginForm {
    private readonly _authService = inject(AuthService);
    private readonly _router = inject(Router);
    private readonly _showPassword = signal(false);

    readonly showPassword = this._showPassword.asReadonly();

    readonly authModel = signal({
        username: '',
        password: ''
    });

    readonly authForm = form(
        this.authModel,
        root => {
            required(root.username);
            required(root.password);
        },
        {
            submission: {
                action: async (authForm) => {
                    const credentials = authForm().value();
                    const response = await this._login(credentials);

                    if (response.error) {
                        authForm.password().value.set('');
                        return [{
                            kind: 'server',
                            message: response.error.message,
                            fieldTree: authForm.password
                        }];
                    }

                    await this._router.navigateByUrl('/tasks');
                    return;
                }
            }
        }
    );

    public toggleShowPassword() {
        this._showPassword.update(value => !value);
    }

    private async _login(credentials: any) {
        const response$ = this._authService.login(credentials);
        const response = await lastValueFrom(response$);
        return response;
    }
}
