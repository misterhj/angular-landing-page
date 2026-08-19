import { Component, ViewChild, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductTableComponent } from './components/product-table/product-table.component';
import { ProductModalComponent } from './components/product-modal/product-modal.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { Product } from '@core/models/product.interface';
import { ProductService } from '@core/services/product.service';

@Component({
	selector: 'app-products',
	standalone: true,
	imports: [
		CommonModule,
		ProductTableComponent,
		ProductModalComponent,
		ConfirmModalComponent
	],
	templateUrl: './products.component.html'
})
export class ProductsComponent {
	private productService = inject(ProductService);

	@ViewChild(ProductTableComponent) productTable!: ProductTableComponent;

	// Estados de creación / edición
	isModalOpen = signal<boolean>(false);
	selectedProduct = signal<Product | null>(null);
	isSaving = signal<boolean>(false);

	// Estados para el Modal de Confirmación de Eliminación
	isDeleteModalOpen = signal<boolean>(false);
	isDeleting = signal<boolean>(false);
	productToDelete = signal<Product | null>(null);

	deleteMessage = computed(() => {
		const prod = this.productToDelete();
		return prod ? `¿Estás seguro de que deseas eliminar el producto "${prod.name}"?` : '';
	});

	handleCreate(): void {
		this.selectedProduct.set(null);
		this.isModalOpen.set(true);
	}

	handleEdit(product: Product): void {
		this.selectedProduct.set(product);
		this.isModalOpen.set(true);
	}

	handleCloseModal(): void {
		this.isModalOpen.set(false);
	}

	// 👈 Conexión HTTP Guardar limpiando el payload
	handleSave(productData: any): void {
		const isEdit = !!productData.id;
		const payload = { ...productData };

		// Si es creación, eliminamos la propiedad 'id' para evitar enviar "id: null" a C#
		if (!isEdit) {
			delete payload.id;
		}

		// Aseguramos que el precio vaya como número
		if (payload.price !== undefined && payload.price !== null) {
			payload.price = Number(payload.price);
		}

		const request$ = isEdit
			? this.productService.updateProduct(payload.id, payload)
			: this.productService.createProduct(payload);

		this.isSaving.set(true);

		request$.subscribe({
			next: () => {
				this.isSaving.set(false);
				this.isModalOpen.set(false);
				if (this.productTable) {
					this.productTable.reload();
				}
			},
			error: (err) => {
				console.error('Error al guardar producto en C#:', err);
				this.isSaving.set(false);
			}
		});
	}

	handleDelete(product: Product): void {
		this.productToDelete.set(product);
		this.isDeleteModalOpen.set(true);
	}

	handleConfirmDelete(): void {
		const prod = this.productToDelete();
		
		if (!prod || prod.id === undefined) return;

		this.isDeleting.set(true);

		this.productService.deleteProduct(prod.id).subscribe({
			next: () => {
				this.isDeleting.set(false);
				this.isDeleteModalOpen.set(false);
				this.productToDelete.set(null);

				if (this.productTable) {
					this.productTable.reload();
				}
			},
			error: (err) => {
				console.error('Error al eliminar producto:', err);
				this.isDeleting.set(false);
			}
		});
	}
}