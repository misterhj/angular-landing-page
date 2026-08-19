import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	// RUTAS PÚBLICAS
	{
		path: '',
		loadComponent: () => import('./features/public/public-layout.component').then(m => m.PublicLayoutComponent),
		children: [
			{
				path: '',
				loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
			},
			{
				path: 'producto/:id',
				loadComponent: () => import('./features/public/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
			}
		]
	},

	// AUTENTICACIÓN
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
	},
	{
		path: 'register',
		loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
	},

	// ZONA ADMIN (Protegida)
	{
		path: 'admin',
		canActivate: [authGuard],
		loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
		children: [
			{
				path: 'dashboard',
				loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
				data: { title: 'Dashboard', icon: 'dashboard', showInSidebar: true }
			},
			{
				path: 'catalog',
				data: { title: 'Catálogo', icon: 'catalog', isDropdown: true },
				children: [
					{
						path: 'products',
						loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent),
						data: { title: 'Productos' }
					},
					{
						path: 'categories',
						loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent),
						data: { title: 'Categorías y Subcats' }
					},
					{
						path: 'brands',
						loadComponent: () => import('./features/admin/brands/brands.component').then(m => m.BrandsComponent),
						data: { title: 'Marcas y Modelos' }
					},
					{
						path: 'sections',
						loadComponent: () => import('./features/admin/sections/sections.component').then(m => m.SectionsComponent),
						data: { title: 'Secciones' }
					}
				]
			},
			{
				path: 'users',
				loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent),
				data: { title: 'Usuarios', icon: 'users', showInSidebar: true }
			},
			{
				path: 'settings',
				loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.SettingsComponent),
				data: { title: 'Configuraciones', icon: 'settings', showInSidebar: true }
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
		redirectTo: ''
	}
];