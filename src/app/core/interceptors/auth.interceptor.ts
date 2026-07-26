import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const platformId = inject(PLATFORM_ID);

	const getCookie = (name: string): string | null => {
		if (!isPlatformBrowser(platformId)) return null;
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
		return null;
	};

	const token = getCookie('admin-token');

	if (token) {
		const authReq = req.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`
			}
		});
		return next(authReq);
	}

	return next(req);
};