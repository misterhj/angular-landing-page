import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:8080/api/v1/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL);
  }
}