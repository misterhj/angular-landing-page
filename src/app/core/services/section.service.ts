import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { Section } from '../models/section.interface';
import { environment } from '@env/environment';
import { readCache, writeCache, removeCache } from '../utils/storage-cache.util';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/sections`;

  // Almacena el Observable cacheado en memoria
  private sectionsCache$?: Observable<Section[]>;

  // Caché persistente en localStorage con expiración
  private readonly STORAGE_KEY = 'lp_sections_v1';
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;

  /**
   * - Sin parámetro 'search': Retorna la lista completa desde la caché (localStorage o 1 sola petición HTTP).
   * - Con 'search': Consulta directo al backend enviando ?q=termino.
   */
  getSections(search?: string): Observable<Section[]> {
    if (search && search.trim() !== '') {
      const params = new HttpParams().set('q', search.trim());
      return this.http.get<Section[]>(this.API_URL, { params });
    }

    const stored = readCache<Section[]>(this.STORAGE_KEY, this.CACHE_TTL_MS);
    if (stored) {
      return of(stored);
    }

    if (!this.sectionsCache$) {
      this.sectionsCache$ = this.http.get<Section[]>(this.API_URL).pipe(
        tap(data => writeCache(this.STORAGE_KEY, data)),
        catchError(err => {
          // Si falla, se limpia para permitir un reintento en la próxima llamada
          this.sectionsCache$ = undefined;
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }

    return this.sectionsCache$;
  }

  // Limpia la memoria local y el localStorage para obligar una nueva llamada HTTP cuando haya cambios
  clearCache(): void {
    this.sectionsCache$ = undefined;
    removeCache(this.STORAGE_KEY);
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