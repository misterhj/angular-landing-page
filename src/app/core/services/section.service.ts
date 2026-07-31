import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { Section } from '../models/section.interface';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class SectionService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/sections`;

	// Almacena el Observable cacheado en memoria
	private sectionsCache$?: Observable<Section[]>;

	/**
	 * - Sin parámetro 'search': Retorna la lista completa desde la caché (1 sola petición HTTP).
	 * - Con 'search': Consulta directo al backend enviando ?q=termino.
	 */
	getSections(search?: string): Observable<Section[]> {
		if (search && search.trim() !== '') {
			const params = new HttpParams().set('q', search.trim());
			return this.http.get<Section[]>(this.API_URL, { params });
		}

		if (!this.sectionsCache$) {
			this.sectionsCache$ = this.http.get<Section[]>(this.API_URL).pipe(
				shareReplay(1)
			);
		}

		return this.sectionsCache$;
	}

	// Limpia la memoria local para obligar una nueva llamada HTTP cuando haya cambios
	clearCache(): void {
		this.sectionsCache$ = undefined;
	}

	createSection(section: Partial<Section>): Observable<Section> {
		return this.http.post<Section>(this.API_URL, section).pipe(
			tap(() => this.clearCache())
		);
	}

	updateSection(id: number, section: Partial<Section>): Observable<Section> {
		return this.http.put<Section>(`${this.API_URL}/${id}`, section).pipe(
			tap(() => this.clearCache())
		);
	}

	deleteSection(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
			tap(() => this.clearCache())
		);
	}
}