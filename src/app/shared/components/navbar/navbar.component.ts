import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '@core/services/category.service';
import { SectionService } from '@core/services/section.service';
import { CatalogFilterService } from '@core/services/catalog-filter.service';
import { Category } from '@core/models/category.interface';
import { Section } from '@core/models/section.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">

          <!-- Fila 1: Brand Logo + Buscador -->
          <div class="flex items-center gap-3 flex-1">
            <a routerLink="/" class="flex items-center gap-2.5 shrink-0">
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-white shadow-sm text-sm sm:text-base">
                CS
              </div>
              <span class="font-bold text-base sm:text-lg text-white tracking-wide whitespace-nowrap">Cute Store</span>
            </a>

            <!-- Buscador -->
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                [ngModel]="catalogFilter.searchTerm()"
                (ngModelChange)="catalogFilter.setSearchTerm($event)"
                placeholder="Buscar productos..."
                class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                *ngIf="catalogFilter.searchTerm()"
                (click)="catalogFilter.setSearchTerm('')"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                title="Limpiar búsqueda"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Filtros por Sección y Categoría -->
          <div class="flex gap-2 w-full sm:w-auto">
            <div class="relative flex-1 sm:w-48">
              <select
                [ngModel]="catalogFilter.selectedSectionId()"
                (ngModelChange)="catalogFilter.setSelectedSectionId($event)"
                class="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-9 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
              >
                <option [ngValue]="null">Todas las secciones</option>
                <option *ngFor="let section of sections()" [ngValue]="section.id">
                  {{ section.name }}
                </option>
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>

            <div class="relative flex-1 sm:w-56">
              <select
                [ngModel]="catalogFilter.selectedCategoryId()"
                (ngModelChange)="catalogFilter.setSelectedCategoryId($event)"
                class="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-9 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
              >
                <option [ngValue]="null">Todas las categorías</option>
                <option *ngFor="let category of categories()" [ngValue]="category.id">
                  {{ category.name }}
                </option>
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private sectionService = inject(SectionService);
  readonly catalogFilter = inject(CatalogFilterService);

  sections = signal<Section[]>([]);
  categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.sectionService.getSections().subscribe({
      next: (sections) => this.sections.set(sections),
      error: (err) => console.error('Error al cargar secciones:', err)
    });

    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }
}
