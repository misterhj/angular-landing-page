import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.interface';

@Component({
	selector: 'app-product-detail',
	standalone: true,
	imports: [CommonModule, RouterLink],
	template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Loader -->
      <div *ngIf="isLoading()" class="py-24 flex justify-center items-center gap-3 text-slate-500">
        <div class="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <span>Cargando producto...</span>
      </div>

      <!-- No encontrado -->
      <div *ngIf="!isLoading() && !product()" class="py-24 text-center">
        <p class="text-slate-500 mb-4">No se encontró el producto solicitado.</p>
        <a routerLink="/" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition">
          Volver al catálogo
        </a>
      </div>

      <div *ngIf="product() as p">

        <!-- Migas de pan -->
        <nav class="text-xs text-slate-400 mb-6 flex flex-wrap items-center gap-1.5">
          <a routerLink="/" class="hover:text-slate-900 transition">Inicio</a>
          <span>/</span>
          <span *ngIf="p.sectionName" class="text-slate-600">{{ p.sectionName }}</span>
          <span *ngIf="p.sectionName && p.categoryName">/</span>
          <span *ngIf="p.categoryName" class="text-slate-600">{{ p.categoryName }}</span>
          <span *ngIf="p.sectionName || p.categoryName">/</span>
          <span class="text-slate-900 font-semibold line-clamp-1">{{ p.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">

<!-- Imagen -->
          <div class="w-full h-72 sm:h-96 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative">
            <img
              *ngIf="primaryImage(p) as imgSrc"
              [src]="imgSrc"
              [alt]="p.name"
              (error)="onImageError($event)"
              class="w-full h-full object-cover"
            />
            <svg *ngIf="!primaryImage(p)" class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>

          <!-- Información -->
          <div class="flex flex-col">

            <div class="flex items-center gap-2 flex-wrap mb-3">
              <span *ngIf="p.brandName" class="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md uppercase tracking-wide">{{ p.brandName }}</span>
              <span *ngIf="p.categoryName" class="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md">{{ p.categoryName }}</span>
              <span *ngIf="p.modelName" class="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md">{{ p.modelName }}</span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{{ p.name }}</h1>

            <div class="mt-3 space-y-1 text-sm text-slate-500">
              <p *ngIf="p.code"><span class="font-semibold text-slate-700">Código:</span> {{ p.code }}</p>
              <p *ngIf="p.barcode"><span class="font-semibold text-slate-700">Código de barras:</span> {{ p.barcode }}</p>
            </div>

            <!-- Disponibilidad -->
            <div class="mt-4">
              <span
                [class]="(p.stock ?? 0) > 0
                  ? 'inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1'
                  : 'inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-3 py-1'">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <ng-container *ngIf="(p.stock ?? 0) > 0; else outOfStock">
                  <ng-container *ngIf="p.stock === 1; else manyStock">Queda 1 unidad</ng-container>
                  <ng-template #manyStock>Quedan {{ p.stock }} unidades</ng-template>
                </ng-container>
                <ng-template #outOfStock>Producto agotado</ng-template>
              </span>
            </div>

            <!-- Precio -->
            <div class="mt-5">
              <span class="text-xs text-slate-400 block">Precio</span>
              <span class="text-3xl font-extrabold text-slate-900">Gs. {{ p.price | number:'1.0-0' }}</span>
            </div>

            <!-- Acciones -->
            <div class="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                (click)="onBuy(p)"
                class="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
              >
                Comprar ahora
              </button>
              <button
                (click)="onInquire(p)"
                class="flex-1 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl transition"
              >
                Consultar
              </button>
            </div>

            <!-- Descripción -->
            <p *ngIf="p.description" class="mt-6 text-sm text-slate-600 leading-relaxed">{{ p.description }}</p>

          </div>
        </div>

        <!-- Especificaciones técnicas -->
        <div *ngIf="specEntries().length > 0" class="mt-12">
          <h2 class="text-lg font-bold text-slate-900 mb-4">Especificaciones técnicas</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2.5">
            <div *ngFor="let entry of specEntries()" class="flex items-start gap-2 text-sm">
              <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span class="text-slate-600"><span class="font-semibold text-slate-900">{{ entry.key }}:</span> {{ entry.value }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private productService = inject(ProductService);

	product = signal<Product | null>(null);
	isLoading = signal<boolean>(true);

	private readonly specifications = signal<Record<string, string> | null | undefined>(undefined);
	readonly specEntries = () =>
		Object.entries(this.specifications() ?? {})
			.map(([key, value]) => ({ key, value }));

	ngOnInit(): void {
		const slug = this.route.snapshot.paramMap.get('slug');
		if (!slug) {
			this.isLoading.set(false);
			this.router.navigateByUrl('/');
			return;
		}

		this.productService.getProductBySlug(slug).subscribe({
			next: (p) => {
				this.product.set(p);
				this.specifications.set(p.specifications);
				this.isLoading.set(false);
			},
			error: (err) => {
				console.error('Error al cargar producto:', err);
				this.isLoading.set(false);
			}
		});
	}

	// Devuelve la URL de la primera imagen de media, con fallback a imageUrl
	primaryImage(product: Product): string | null {
		const firstImage = (product.media ?? []).find(m => m.mediaType === 'image');
		return firstImage?.url ?? product.imageUrl ?? null;
	}

	onBuy(product: Product): void {
		// TODO: conectar con el flujo de venta / carrito
		console.log('Comprar:', product.id, product.name);
	}

	onInquire(product: Product): void {
		// TODO: conectar con el canal de consultas (WhatsApp, formulario, etc.)
		console.log('Consultar:', product.id, product.name);
	}

	onImageError(event: Event): void {
		(event.target as HTMLElement).style.display = 'none';
	}
}