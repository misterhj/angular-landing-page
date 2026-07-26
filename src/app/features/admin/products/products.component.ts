import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header de la sección -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Inventario de Productos</h1>
          <p class="text-slate-400 text-sm mt-1">Administra las fundas y accesorios disponibles en la tienda</p>
        </div>
        <button 
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg hover:shadow-blue-500/20 transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Producto
        </button>
      </div>

      <!-- Filtro y Búsqueda -->
      <div class="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div class="relative flex-1 max-w-md">
          <svg class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por nombre o categoría..." 
            class="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <span class="text-xs text-slate-400">Total: <strong class="text-white">{{ filteredProducts().length }}</strong> items</span>
      </div>

      <!-- Estado de Carga -->
      <div *ngIf="isLoading()" class="p-12 text-center text-slate-400">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-3"></div>
        <p class="text-sm">Cargando productos...</p>
      </div>

      <!-- Tabla de Productos -->
      <div *ngIf="!isLoading()" class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="bg-slate-950/50 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="p-4">Producto</th>
                <th class="p-4">Categoría</th>
                <th class="p-4">Precio</th>
                <th class="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr *ngFor="let product of filteredProducts()" class="hover:bg-slate-800/40 transition group">
                <td class="p-4 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name" class="w-full h-full object-cover"/>
                    <svg *ngIf="!product.imageUrl" class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <span class="font-medium text-white block">{{ product.name }}</span>
                    <span class="text-xs text-slate-500 line-clamp-1">{{ product.description || 'Sin descripción' }}</span>
                  </div>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-blue-400 border border-slate-700">
                    {{ product.category?.name || 'General' }}
                  </span>
                </td>
                <td class="p-4 font-semibold text-white">
                  $ {{ product.price | number:'1.2-2' }}
                </td>
                <td class="p-4 text-right space-x-2">
                  <button class="p-1.5 text-slate-400 hover:text-blue-400 transition" title="Editar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button class="p-1.5 text-slate-400 hover:text-red-400 transition" title="Eliminar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredProducts().length === 0">
                <td colspan="4" class="p-8 text-center text-slate-500">
                  No se encontraron productos registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);

  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category?.name.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}