import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { Category } from '../models/category.interface';
import { CategoryModalPayload } from '@features/admin/categories/category-modal.component';
import { environment } from '@env/environment';
import { readCache, writeCache, removeCache } from '../utils/storage-cache.util';

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/categories`;

	private categoriesCache$?: Observable<Category[]>;
	private subcategoriesCache$?: Observable<Category[]>;

	// Caché persistente en localStorage con expiración
	private readonly STORAGE_KEY = 'lp_categories_v1';
	private readonly CACHE_TTL_MS = 10 * 60 * 1000;

	/**
	 * Categorías Principales
	 */
	getCategories(search?: string): Observable<Category[]> {
		if (search && search.trim() !== '') {
			const params = new HttpParams().set('q', search.trim());
			return this.http.get<Category[]>(this.API_URL, { params });
		}

		const stored = readCache<Category[]>(this.STORAGE_KEY, this.CACHE_TTL_MS);
		if (stored) {
			return of(stored);
		}

		if (!this.categoriesCache$) {
			this.categoriesCache$ = this.http.get<Category[]>(this.API_URL).pipe(
				tap(data => writeCache(this.STORAGE_KEY, data)),
				catchError(err => {
					// Si falla, se limpia para permitir un reintento en la próxima llamada
					this.categoriesCache$ = undefined;
					return throwError(() => err);
				}),
				shareReplay(1)
			);
		}

		return this.categoriesCache$;
	}

	/**
	 * Obtener Subcategorías (filtradas por la categoría padre si se especifica)
	 */
	getSubcategories(parentId?: number | null, search?: string): Observable<Category[]> {
		const subApiUrl = `${this.API_URL}/subcategories`;
		let params = new HttpParams();

		if (parentId) {
			params = params.set('parentId', parentId.toString());
		}

		if (search && search.trim() !== '') {
			params = params.set('q', search.trim());
		}

		return this.http.get<Category[]>(subApiUrl, { params });
	}

	clearCache(): void {
		this.categoriesCache$ = undefined;
		this.subcategoriesCache$ = undefined;
		removeCache(this.STORAGE_KEY);
	}

	createCategory(category: CategoryModalPayload | Partial<Category>): Observable<Category> {
		return this.http.post<Category>(this.API_URL, category).pipe(
			tap(() => this.clearCache())
		);
	}

	updateCategory(id: number, category: CategoryModalPayload | Partial<Category>): Observable<Category> {
		return this.http.put<Category>(`${this.API_URL}/${id}`, category).pipe(
			tap(() => this.clearCache())
		);
	}

	deleteCategory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
			tap(() => this.clearCache())
		);
	}
}