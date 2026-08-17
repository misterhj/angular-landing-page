import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class CatalogFilterService {
	readonly searchTerm = signal<string>('');
	readonly selectedSectionId = signal<number | null>(null);
	readonly selectedCategoryId = signal<number | null>(null);

	setSearchTerm(term: string): void {
		this.searchTerm.set(term);
	}

	setSelectedSectionId(id: number | null): void {
		this.selectedSectionId.set(id);
	}

	setSelectedCategoryId(id: number | null): void {
		this.selectedCategoryId.set(id);
	}

	clear(): void {
		this.searchTerm.set('');
		this.selectedSectionId.set(null);
		this.selectedCategoryId.set(null);
	}
}
