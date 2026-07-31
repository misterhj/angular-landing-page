import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand } from '../models/brand.interface';
import { environment } from '@env/environment';

@Injectable({
    providedIn: 'root'
})
export class BrandService {
    private http = inject(HttpClient);
    private API_URL = `${environment.apiUrl}/brands`;

    getBrands(): Observable<Brand[]> {
        return this.http.get<Brand[]>(this.API_URL);
    }

    createBrand(brand: Partial<Brand>): Observable<Brand> {
        return this.http.post<Brand>(this.API_URL, brand);
    }

    updateBrand(id: number, brand: Partial<Brand>): Observable<Brand> {
        return this.http.put<Brand>(`${this.API_URL}/${id}`, brand);
    }

    deleteBrand(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}