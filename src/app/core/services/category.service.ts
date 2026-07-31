import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.interface';
import { CategoryModalPayload } from '@features/admin/categories/category-modal.component';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/categories`;

	getCategories(): Observable<Category[]> {
		return this.http.get<Category[]>(this.API_URL);
	}

	createCategory(category: CategoryModalPayload | Partial<Category>): Observable<Category> {
		return this.http.post<Category>(this.API_URL, category);
	}

	updateCategory(id: number, category: CategoryModalPayload | Partial<Category>): Observable<Category> {
		return this.http.put<Category>(`${this.API_URL}/${id}`, category);
	}

	deleteCategory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}
}