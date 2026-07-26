import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	},
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
	},

	// ZONA DE ADMINISTRACIÓN (Protegida)
	{
		path: 'admin',
		canActivate: [authGuard],
		loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
		children: [
			{
				path: 'dashboard',
				loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
			},
			{
				path: 'products',
				loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent)
			},
			{
				path: '',
				redirectTo: 'dashboard',
				pathMatch: 'full'
			}
		]
	},

	{
		path: '**',
		redirectTo: 'login'
	}
];