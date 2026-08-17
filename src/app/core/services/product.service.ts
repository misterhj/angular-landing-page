import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.interface';
import { PagedResultDto } from '../models/table-data.interface';
import { environment } from '@env/environment';

export interface ProductQueryParams {
	pageIndex?: number;
	pageSize?: number;
	sectionId?: number;
	categoryId?: number;
	search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/products`;

  getProducts(params?: ProductQueryParams): Observable<PagedResultDto<Product>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageIndex != null) httpParams = httpParams.set('pageIndex', params.pageIndex);
      if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
      if (params.sectionId != null) httpParams = httpParams.set('sectionId', params.sectionId);
      if (params.categoryId != null) httpParams = httpParams.set('categoryId', params.categoryId);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PagedResultDto<Product>>(this.API_URL, { params: httpParams });
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}