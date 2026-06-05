import { Routes } from '@angular/router';
import { LoginForm } from './login/login';
import { authGuard } from './shared/guards/auth-guard';
import { TaskList } from './tasks/task-list/task-list';
import { TaskEdit } from './tasks/task-edit/task-edit';
import { taskResolver } from './tasks/shared/resolvers';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginForm,
        title: 'Login | ToDo Application'
    },
    {
        path: 'tasks',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: TaskList,
                title: 'Task List | ToDo Application'
            },
            {
                path: ':id',
                component: TaskEdit,
                title: 'Edit Task | ToDo Application',
                resolve: { task: taskResolver }
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/tasks'
    }
];
