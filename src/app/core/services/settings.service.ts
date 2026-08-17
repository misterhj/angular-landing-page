import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { Settings } from '../models/settings.interface';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class SettingsService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/settings`;

	// Almacena el Observable cacheado en memoria
	private settingsCache$?: Observable<Settings[]>;

	// Obtiene el listado de todas las configuraciones activas
	getSettings(): Observable<Settings[]> {
		if (!this.settingsCache$) {
			this.settingsCache$ = this.http.get<Settings[]>(this.API_URL).pipe(
				shareReplay(1)
			);
		}

		return this.settingsCache$;
	}

	// Busca una configuración por su clave (ej: /settings/key/Api:SyncKey)
	getSettingsByKey(key: string): Observable<Settings> {
		return this.http.get<Settings>(`${this.API_URL}/key/${key}`);
	}

	// Crea una nueva clave/valor en AppSettings
	createSettings(settings: Partial<Settings>): Observable<Settings> {
		return this.http.post<Settings>(this.API_URL, settings).pipe(
			tap(() => this.clearCache())
		);
	}

	// Actualiza el valor/descripción e invalida automáticamente la memoria caché
	updateSettings(id: number, settings: Partial<Settings>): Observable<Settings> {
		return this.http.put<Settings>(`${this.API_URL}/${id}`, settings).pipe(
			tap(() => this.clearCache())
		);
	}

	// Realiza Soft Delete e invalida la memoria caché
	deleteSettings(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
			tap(() => this.clearCache())
		);
	}

	// Limpia la memoria local para obligar una nueva llamada HTTP cuando haya cambios
	clearCache(): void {
		this.settingsCache$ = undefined;
	}
}
