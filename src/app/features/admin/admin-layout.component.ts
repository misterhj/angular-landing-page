import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
	selector: 'app-admin-layout',
	standalone: true,
	imports: [CommonModule, RouterOutlet, SidebarComponent],
	templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
	private authService = inject(AuthService);
	private router = inject(Router);
	private platformId = inject(PLATFORM_ID);

	// Estado del Sidebar (Abierto por defecto)
	sidebarOpen = signal<boolean>(true);

	// Datos del usuario logueado
	username = signal<string>(this.authService.getUserName());
	userInitial = signal<string>(this.username().charAt(0).toUpperCase());

	constructor() {
		// Si la pantalla es pequeña (móvil/tableta vertical), iniciamos con el menú cerrado
		if (isPlatformBrowser(this.platformId) && window.innerWidth < 768) {
			this.sidebarOpen.set(false);
		}

		// En móviles, cerrar automáticamente al cambiar de ruta
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe(() => {
			if (isPlatformBrowser(this.platformId) && window.innerWidth < 768) {
				this.sidebarOpen.set(false);
			}
		});
	}

	toggleSidebar(): void {
		this.sidebarOpen.update(state => !state);
	}

	logout(): void {
		this.authService.logout();
	}
}