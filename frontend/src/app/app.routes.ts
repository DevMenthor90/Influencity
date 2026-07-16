import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'deals', loadComponent: () => import('./features/deals/deals-list.component').then(m => m.DealsListComponent) },
      { path: 'deals/new', loadComponent: () => import('./features/deals/deal-form.component').then(m => m.DealFormComponent) },
      { path: 'deals/:id', loadComponent: () => import('./features/deals/deal-form.component').then(m => m.DealFormComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
