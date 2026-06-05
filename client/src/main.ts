import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

const logBootstrapError = async (err: unknown) => {
    const payload = err instanceof Error
        ? { message: err.message, stack: err.stack }
        : { message: String(err) };

    try {
        return await fetch(`${environment.apiUrl}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, source: 'bootstrap' }),
        });
    } catch {
        return null;
    }
};

bootstrapApplication(App, appConfig).catch(logBootstrapError);
