import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario está autenticado, permitimos el paso
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no, lo redirigimos al login
  router.navigate(['/login']);
  return false;
};