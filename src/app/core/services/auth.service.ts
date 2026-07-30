import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';

export interface LoginResponse {
	token: string;
}

export interface RegisterResponse {
	message: string;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private http = inject(HttpClient);
	private router = inject(Router);
	private platformId = inject(PLATFORM_ID);

	private API_URL = `${environment.apiUrl}/auth`;

	isAuthenticated = signal<boolean>(this.checkTokenExists());

	// METODO LOGIN
	login(credentials: { username: string; password: string }): Observable<LoginResponse> {
		return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
			tap((response) => {
				if (response && response.token) {
					this.setCookie('admin-token', response.token, 7);
					this.isAuthenticated.set(true);
				}
			})
		);
	}

	// METODO REGISTER
	register(credentials: { username: string; password: string }): Observable<RegisterResponse> {
		return this.http.post<RegisterResponse>(`${this.API_URL}/register`, credentials);
	}

	// METODO LOGOUT
	logout(): void {
		this.deleteCookie('admin-token');
		this.isAuthenticated.set(false);
		this.router.navigate(['/login']);
	}

	getUserName(): string {
		const token = this.getCookie('admin-token');
		if (!token) return 'Admin';

		try {
			const payloadBase64 = token.split('.')[1];
			const decodedJson = atob(payloadBase64);
			const decoded = JSON.parse(decodedJson);
			
			// Retorna el claim de nombre o sub, o 'Admin' por defecto
			return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
				|| decoded.sub 
				|| decoded.unique_name 
				|| 'Admin';
		} catch {
			return 'Admin';
		}
	}

	// Cambio: Método público para consultarlo en el Guard si es necesario
	public checkTokenExists(): boolean {
		return !!this.getCookie('admin-token');
	}

	private setCookie(name: string, value: string, days: number): void {
		if (!isPlatformBrowser(this.platformId)) return;
		
		const seconds = days * 24 * 60 * 60;
		const date = new Date();
		date.setTime(date.getTime() + seconds * 1000);
		
		// Añadimos max-age y SameSite=Lax para compatibilidad en redes locales y dispositivos móviles
		document.cookie = `${name}=${value};expires=${date.toUTCString()};max-age=${seconds};path=/;SameSite=Lax`;
	}

	public getCookie(name: string): string | null {
		if (!isPlatformBrowser(this.platformId)) return null;
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
		return null;
	}

	private deleteCookie(name: string): void {
		if (!isPlatformBrowser(this.platformId)) return;
		document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;max-age=0;path=/;SameSite=Lax`;
	}
}