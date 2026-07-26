import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.interface';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- HERO SECTION -->
    <section class="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-28">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          Protección Premium & Estilo
        </span>
        
        <h1 class="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Fundas diseñadas para elevar la apariencia de tu dispositivo.
        </h1>
        
        <p class="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
          Encuentra la máxima protección anticaídas con acabados de alta calidad, diseños magsafe y estéticas exclusivas para tu smartphone.
        </p>

        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <a routerLink="/catalog" class="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5">
            Explorar Catálogo
          </a>
          <a href="#destacados" class="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-800 transition">
            Ver Destacados
          </a>
        </div>
      </div>
    </section>

    <!-- PRODUCTOS DESTACADOS -->
    <section id="destacados" class="py-16 bg-slate-900/50 border-t border-slate-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-white tracking-tight">Fundas Populares</h2>
            <p class="text-slate-400 text-sm mt-1">Nuestros modelos más cotizados del catálogo</p>
          </div>
          <a routerLink="/catalog" class="text-sm font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
            Ver todos &rarr;
          </a>
        </div>

        <!-- Spinner -->
        <div *ngIf="isLoading()" class="py-12 text-center text-slate-500">
          Cargando productos destacados...
        </div>

        <!-- Grid de Productos -->
        <div *ngIf="!isLoading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let product of featuredProducts()" class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col hover:border-slate-700 transition group">
            
            <div class="w-full h-56 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center relative mb-4">
              <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
              <svg *ngIf="!product.imageUrl" class="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>

            <div class="flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  {{ product.category?.name || 'Case' }}
                </span>
                <h3 class="font-bold text-white text-base mt-2 group-hover:text-blue-400 transition">{{ product.name }}</h3>
                <p class="text-xs text-slate-400 mt-1 line-clamp-2">{{ product.description || 'Protección de alta resistencia.' }}</p>
              </div>

              <div class="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <span class="text-lg font-extrabold text-white">$ {{ product.price | number:'1.2-2' }}</span>
                <button class="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition" title="Consultar">
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
        // Tomamos los primeros 4 productos para la sección destacada
        this.featuredProducts.set(products.slice(0, 4));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}