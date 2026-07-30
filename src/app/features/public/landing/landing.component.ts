import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.interface';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `

    <!-- PRODUCTOS DESTACADOS -->
    <section id="destacados" class="py-16 bg-slate-900/50 border-t border-slate-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-white tracking-tight">Fundas Destacadas</h2>
            <p class="text-slate-400 text-sm mt-1">Nuestros modelos más cotizados del catálogo</p>
          </div>
          <a routerLink="/catalog" class="text-sm font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
            Ver todos &rarr;
          </a>
        </div>

        <!-- Spinner / Loader -->
        <div *ngIf="isLoading()" class="py-12 flex justify-center items-center gap-3 text-slate-400">
          <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando productos destacados...</span>
        </div>

        <!-- Sin Productos -->
        <div *ngIf="!isLoading() && featuredProducts().length === 0" class="py-12 text-center text-slate-500">
          No hay productos destacados disponibles por el momento.
        </div>

        <!-- Grid de Productos -->
        <div *ngIf="!isLoading() && featuredProducts().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let product of featuredProducts()" class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col hover:border-slate-700 transition group">
            
            <!-- Imagen del Producto -->
            <div class="w-full h-56 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center relative mb-4">
              <img 
                *ngIf="product.imageUrl" 
                [src]="product.imageUrl" 
                [alt]="product.name" 
                (error)="onImageError($event)"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <svg *ngIf="!product.imageUrl" class="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>

            <!-- Información -->
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <!-- Muestra Sección primero; si no, Categoría -->
                <span class="text-[10px] font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  {{ product.section?.name || product.category?.name || 'Case' }}
                </span>
                <h3 class="font-bold text-white text-base mt-2 group-hover:text-blue-400 transition line-clamp-1">
                  {{ product.name }}
                </h3>
                <p class="text-xs text-slate-400 mt-1 line-clamp-2">
                  {{ product.description || 'Protección de alta resistencia inspirada en diseños exclusivos.' }}
                </p>
              </div>

              <!-- Precio y Acción -->
              <div class="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div>
                  <span class="text-xs text-slate-500 block">Precio</span>
                  <span class="text-lg font-extrabold text-white">
                    $ {{ product.price | number:'1.0-0' }}
                  </span>
                </div>
                <button class="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-600/20" title="Consultar o Comprar">
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

  featuredProducts = signal<Product[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        // 1. Buscamos primero productos asignados a alguna sección (ej: Destacados)
        const sectionProducts = products.filter(p => p.sectionId !== null && p.sectionId !== undefined);

        // 2. Si hay productos con sección, usamos esos; de lo contrario, tomamos los 4 más recientes
        if (sectionProducts.length > 0) {
          this.featuredProducts.set(sectionProducts.slice(0, 4));
        } else {
          this.featuredProducts.set(products.slice(0, 4));
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Si la imagen enviada por la URL scrapeada falla, ocultamos el tag <img> para activar el SVG de fallback
  onImageError(event: Event): void {
    (event.target as HTMLElement).style.display = 'none';
  }
}