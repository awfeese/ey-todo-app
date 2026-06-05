import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MaterialModule } from './shared';
import { AuthService } from './shared/services';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MaterialModule, RouterOutlet]
})
export class App {
    private readonly _router = inject(Router);
    private readonly _authService = inject(AuthService);

    readonly isLoggedIn = computed(() => this._authService.isLoggedIn());

    public logout(): void {
        this._authService.logout();
        this._router.navigateByUrl('/login');
    }
}
