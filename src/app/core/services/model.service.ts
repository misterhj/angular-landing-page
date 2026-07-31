import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { Model } from '../models/model.interface';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class ModelService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/models`;

	private modelsCache$?: Observable<Model[]>;

	getModels(brandId?: number, search?: string): Observable<Model[]> {
		let params = new HttpParams();

		if (brandId) {
			params = params.set('brandId', brandId);
		}

		if (search && search.trim() !== '') {
			params = params.set('q', search.trim());
		}

		// Si viene filtrado por marca o por término de búsqueda, consultamos directamente a la API
		if (brandId || (search && search.trim() !== '')) {
			return this.http.get<Model[]>(this.API_URL, { params });
		}

		// Si no hay filtros, aprovechamos la caché general de modelos
		if (!this.modelsCache$) {
			this.modelsCache$ = this.http.get<Model[]>(this.API_URL).pipe(
				shareReplay(1)
			);
		}

		return this.modelsCache$;
	}

	clearCache(): void {
		this.modelsCache$ = undefined;
	}

	createModel(model: Partial<Model>): Observable<Model> {
		return this.http.post<Model>(this.API_URL, model).pipe(
			tap(() => this.clearCache())
		);
	}

	updateModel(id: number, model: Partial<Model>): Observable<Model> {
		return this.http.put<Model>(`${this.API_URL}/${id}`, model).pipe(
			tap(() => this.clearCache())
		);
	}

	deleteModel(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
			tap(() => this.clearCache())
		);
	}
}