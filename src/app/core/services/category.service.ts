import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.interface';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/categories`;

	getCategories(): Observable<Category[]> {
		return this.http.get<Category[]>(this.API_URL);
	}

	createCategory(category: Partial<Category>): Observable<Category> {
		return this.http.post<Category>(this.API_URL, category);
	}

	deleteCategory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}
}