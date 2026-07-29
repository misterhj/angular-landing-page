import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);
	const platformId = inject(PLATFORM_ID);

	// Si se ejecuta en el Servidor (SSR), permitimos la navegación inicial
	// para que el navegador descargue el cliente y lea las cookies locales.
	if (!isPlatformBrowser(platformId)) {
		return true;
	}

	// En el navegador, verificamos la cookie
	if (authService.checkTokenExists()) {
		return true;
	}

	// Si no hay token en el navegador, redirigir a Login
	router.navigate(['/login']);
	return false;
};