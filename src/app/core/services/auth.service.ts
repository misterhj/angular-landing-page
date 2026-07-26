import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment'; // <--- Importar aquí

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Concatenamos la base con el endpoint específico
  private API_URL = `${environment.apiUrl}/auth`;

  isAuthenticated = signal<boolean>(this.checkTokenExists());

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

  logout(): void {
    this.deleteCookie('admin-token');
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private checkTokenExists(): boolean {
    return !!this.getCookie('admin-token');
  }

  private setCookie(name: string, value: string, days: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }

  private getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private deleteCookie(name: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}