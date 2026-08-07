import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class CatalogFilterService {
	readonly searchTerm = signal<string>('');
	readonly selectedCategoryId = signal<number | null>(null);

	setSearchTerm(term: string): void {
		this.searchTerm.set(term);
	}

	setSelectedCategoryId(id: number | null): void {
		this.selectedCategoryId.set(id);
	}

	clear(): void {
		this.searchTerm.set('');
		this.selectedCategoryId.set(null);
	}
}
