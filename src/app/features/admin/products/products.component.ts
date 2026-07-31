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
	private productService = inject(ProductService); // 👈 Inyección del servicio

	@ViewChild(ProductTableComponent) productTable!: ProductTableComponent;

	// Estados de creación / edición
	isModalOpen = signal<boolean>(false);
	selectedProduct = signal<Product | null>(null);

	// Estados para el Modal de Confirmación de Eliminación
	isDeleteModalOpen = signal<boolean>(false);
	isDeleting = signal<boolean>(false);
	productToDelete = signal<Product | null>(null);

	// Mensaje dinámico para el modal
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

	// 👈 Conexión HTTP Guardar (POST / PUT)
	handleSave(productData: any): void {
		const isEdit = !!productData.id;

		const request$ = isEdit
			? this.productService.updateProduct(productData.id, productData)
			: this.productService.createProduct(productData);

		request$.subscribe({
			next: () => {
				this.isModalOpen.set(false);
				if (this.productTable) {
					this.productTable.reload();
				}
			},
			error: (err) => console.error('Error al guardar producto:', err)
		});
	}

	handleDelete(product: Product): void {
		this.productToDelete.set(product);
		this.isDeleteModalOpen.set(true);
	}

	// 👈 Conexión HTTP Eliminar (DELETE)
// Conexión HTTP Eliminar (DELETE)
	handleConfirmDelete(): void {
		const prod = this.productToDelete();
		
		// 👈 Agregamos la validación de prod.id
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