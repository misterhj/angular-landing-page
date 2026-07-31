import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Model } from '../models/model.interface';
import { environment } from '@env/environment';

@Injectable({
    providedIn: 'root'
})
export class ModelService {
    private http = inject(HttpClient);
    private API_URL = `${environment.apiUrl}/models`;

    getModels(brandId?: number): Observable<Model[]> {
        const url = brandId ? `${this.API_URL}?brandId=${brandId}` : this.API_URL;
        return this.http.get<Model[]>(url);
    }

    createModel(model: Partial<Model>): Observable<Model> {
        return this.http.post<Model>(this.API_URL, model);
    }

    updateModel(id: number, model: Partial<Model>): Observable<Model> {
        return this.http.put<Model>(`${this.API_URL}/${id}`, model);
    }

    deleteModel(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}