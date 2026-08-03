import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth routes (public - login only)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      { path: '**', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Protected routes (require auth)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'students',
    canActivate: [authGuard],
    loadComponent: () => import('./features/students/student-list/student-list.component').then(m => m.StudentListComponent),
  },
  {
    path: 'attendance',
    canActivate: [authGuard],
    loadComponent: () => import('./features/attendance/attendance.component').then(m => m.AttendanceComponent),
  },
  {
    path: 'students/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/students/student-form/student-form.component').then(m => m.StudentFormComponent),
  },
  {
    path: 'students/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/students/student-detail/student-detail.component').then(m => m.StudentDetailComponent),
  },
  {
    path: 'students/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/students/student-form/student-form.component').then(m => m.StudentFormComponent),
  },

  // Fallback
  { path: '**', redirectTo: '/auth/login' },
];
