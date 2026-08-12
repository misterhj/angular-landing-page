import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@core/services/product.service';
import { CatalogFilterService } from '@core/services/catalog-filter.service';
import { Product } from '@core/models/product.interface';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- CATÁLOGO -->
    <section id="catalog" class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Spinner / Loader -->
        <div *ngIf="isCatalogLoading()" class="py-12 flex justify-center items-center gap-3 text-slate-500">
          <div class="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando catálogo...</span>
        </div>

        <!-- Sin Productos -->
        <div *ngIf="!isCatalogLoading() && filteredProducts().length === 0" class="py-12 text-center text-slate-400">
          No se encontraron productos que coincidan con tu búsqueda.
        </div>

        <!-- Grid de Productos -->
        <div *ngIf="!isCatalogLoading() && filteredProducts().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let product of filteredProducts()" class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition group">
            
            <!-- Imagen del Producto -->
            <div class="w-full h-56 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative mb-4">
              <img 
                *ngIf="product.imageUrl" 
                [src]="product.imageUrl" 
                [alt]="product.name" 
                (error)="onImageError($event)"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <svg *ngIf="!product.imageUrl" class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>

            <!-- Información -->
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <!-- Muestra Sección primero; si no, Categoría -->
                <span class="text-[10px] font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {{ product.section?.name || product.category?.name || 'Case' }}
                </span>
                <h3 class="font-bold text-slate-900 text-base mt-2 group-hover:text-slate-600 transition line-clamp-1">
                  {{ product.name }}
                </h3>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                  {{ product.description || 'Protección de alta resistencia inspirada en diseños exclusivos.' }}
                </p>
              </div>

              <!-- Precio y Acción -->
              <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-xs text-slate-400 block">Precio</span>
                  <span class="text-lg font-extrabold text-slate-900">
                    Gs. {{ product.price | number:'1.0-0' }}
                  </span>
                </div>
                <button class="p-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl transition shadow-sm" title="Consultar o Comprar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  `
})
export class LandingComponent implements OnInit {
  private productService = inject(ProductService);
  readonly catalogFilter = inject(CatalogFilterService);

  allProducts = signal<Product[]>([]);
  isCatalogLoading = signal<boolean>(true);

  filteredProducts = computed(() => {
    const term = this.catalogFilter.searchTerm().trim().toLowerCase();
    const categoryId = this.catalogFilter.selectedCategoryId();

    return this.allProducts().filter((product) => {
      if (categoryId !== null && product.categoryId !== categoryId) {
        return false;
      }

      if (term) {
        const haystack = [
          product.name,
          product.description,
          product.brand?.name,
          product.model?.name,
          product.section?.name,
          product.category?.name
        ].filter(Boolean).join(' ').toLowerCase();

        if (!haystack.includes(term)) {
          return false;
        }
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isCatalogLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isCatalogLoading.set(false);
      }
    });
  }

  // Si la imagen enviada por la URL scrapeada falla, ocultamos el tag <img> para activar el SVG de fallback
  onImageError(event: Event): void {
    (event.target as HTMLElement).style.display = 'none';
  }
}