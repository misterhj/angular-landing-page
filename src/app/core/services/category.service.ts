import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { Category } from '../models/category.interface';
import { CategoryModalPayload } from '@features/admin/categories/category-modal.component';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/categories`;

	private categoriesCache$?: Observable<Category[]>;
	private subcategoriesCache$?: Observable<Category[]>;

	/**
	 * Categorías Principales
	 */
	getCategories(search?: string): Observable<Category[]> {
		if (search && search.trim() !== '') {
			const params = new HttpParams().set('q', search.trim());
			return this.http.get<Category[]>(this.API_URL, { params });
		}

		if (!this.categoriesCache$) {
			this.categoriesCache$ = this.http.get<Category[]>(this.API_URL).pipe(
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