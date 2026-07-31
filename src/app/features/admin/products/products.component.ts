import { Component, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductTableComponent } from './components/product-table/product-table.component';
import { ProductModalComponent } from './components/product-modal/product-modal.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { Product } from '@core/models/product.interface';

@Component({
	selector: 'app-products',
	standalone: true,
	imports: [
		CommonModule,
		ProductTableComponent,
		ProductModalComponent,
		ConfirmModalComponent // 👈 Importamos el modal reutilizable
	],
	templateUrl: './products.component.html'
})
export class ProductsComponent {

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

	handleSave(productData: any): void {
		console.log('Guardando en Backend:', productData);

		this.isModalOpen.set(false);
		if (this.productTable) {
			this.productTable.reload();
		}
	}

	// 👈 1. Al presionar el tachito de basura, guardamos el producto y abrimos el modal
	handleDelete(product: Product): void {
		this.productToDelete.set(product);
		this.isDeleteModalOpen.set(true);
	}

	// 👈 2. Al confirmar dentro del modal estilizado
	handleConfirmDelete(): void {
		const prod = this.productToDelete();
		if (!prod) return;

		this.isDeleting.set(true);

		// Simulamos la llamada al servicio de backend
		setTimeout(() => {
			console.log('Producto eliminado con éxito:', prod);

			this.isDeleting.set(false);
			this.isDeleteModalOpen.set(false);
			this.productToDelete.set(null);

			if (this.productTable) {
				this.productTable.reload();
			}
		}, 600);
	}
}