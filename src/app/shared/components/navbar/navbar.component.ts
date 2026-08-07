import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '@core/services/category.service';
import { CatalogFilterService } from '@core/services/catalog-filter.service';
import { Category } from '@core/models/category.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center gap-3">

        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-3 shrink-0">
          <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
            CZ
          </div>
          <span class="font-bold text-lg text-white tracking-wide">Case Zone</span>
        </a>

        <!-- Buscador y Filtro -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 lg:max-w-2xl lg:ml-auto w-full">

          <!-- Buscador -->
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [ngModel]="catalogFilter.searchTerm()"
              (ngModelChange)="catalogFilter.setSearchTerm($event)"
              placeholder="Buscar productos..."
              class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              *ngIf="catalogFilter.searchTerm()"
              (click)="catalogFilter.setSearchTerm('')"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              title="Limpiar búsqueda"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Filtro por Categoría -->
          <div class="relative sm:w-60">
            <select
              [ngModel]="catalogFilter.selectedCategoryId()"
              (ngModelChange)="catalogFilter.setSelectedCategoryId($event)"
              class="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-9 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
            >
              <option [ngValue]="null">Todas las categorías</option>
              <option *ngFor="let category of categories()" [ngValue]="category.id">
                {{ category.name }}
              </option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit {
  private categoryService = inject(CategoryService);
  readonly catalogFilter = inject(CatalogFilterService);

  categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }
}
