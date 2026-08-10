import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError, EMPTY } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {

            const isLoginCall = req.url.includes('/auth/login');

            let customErrorMessage = 'Ocurrió un error inesperado.';

            if (isLoginCall && error.error?.message) {
                customErrorMessage = error.error.message;
            } else if (error.status === 0) {
                customErrorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
            } else if (error.status === 401) {
                customErrorMessage = 'No autorizado.';
            } else if (error.status === 403) {
                customErrorMessage = 'Sin permisos.';
            } else if (error.error?.message) {
                customErrorMessage = error.error.message;
            }

            if (isPlatformBrowser(platformId)) {
                console.error('Error HTTP en cliente:', error);
            } else {
                console.error(`[SSR HTTP Error] ${req.method} ${req.url}:`, error.message);
                return EMPTY;
            }

            return throwError(() => new Error(customErrorMessage));
        })
    );
};