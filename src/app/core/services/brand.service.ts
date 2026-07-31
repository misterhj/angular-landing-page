import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { Brand } from '../models/brand.interface';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class BrandService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/brands`;

	private brandsCache$?: Observable<Brand[]>;

	getBrands(search?: string): Observable<Brand[]> {
		if (search && search.trim() !== '') {
			const params = new HttpParams().set('q', search.trim());
			return this.http.get<Brand[]>(this.API_URL, { params });
		}

		if (!this.brandsCache$) {
			this.brandsCache$ = this.http.get<Brand[]>(this.API_URL).pipe(
				shareReplay(1)
			);
		}

		return this.brandsCache$;
	}

	clearCache(): void {
		this.brandsCache$ = undefined;
	}

	createBrand(brand: Partial<Brand>): Observable<Brand> {
		return this.http.post<Brand>(this.API_URL, brand).pipe(
			tap(() => this.clearCache())
		);
	}

	updateBrand(id: number, brand: Partial<Brand>): Observable<Brand> {
		return this.http.put<Brand>(`${this.API_URL}/${id}`, brand).pipe(
			tap(() => this.clearCache())
		);
	}

	deleteBrand(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
			tap(() => this.clearCache())
		);
	}
}