import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let customErrorMessage = 'Ocurrió un error inesperado.';

            // status === 0 significa que la petición no llegó al servidor (CORS, red, API apagada)
            if (error.status === 0) {
                customErrorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté encendido y que la URL o los permisos CORS sean correctos.';
            } else if (error.status === 401) {
                customErrorMessage = 'No autorizado. Verifica tus credenciales o token.';
            } else if (error.status === 403) {
                customErrorMessage = 'No tienes permisos para realizar esta acción.';
            } else if (error.error?.message) {
                // Mensaje personalizado desde el backend si existe
                customErrorMessage = error.error.message;
            }

            // Devolvemos el error transformado como un objeto Error estándar
            return throwError(() => new Error(customErrorMessage));
        })
    );
};