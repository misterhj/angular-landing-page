import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.interface';

@Component({
	selector: 'app-products',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule],
	templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
	private productService = inject(ProductService);
	private fb = inject(FormBuilder);

	products = signal<Product[]>([]);
	searchQuery = signal<string>('');
	isLoading = signal<boolean>(true);

	// Señales para el modal y estado de guardado
	isModalOpen = signal<boolean>(false);
	isSaving = signal<boolean>(false);

	// Formulario para crear producto
	productForm = this.fb.group({
		name: ['', [Validators.required]],
		description: [''],
		price: [0, [Validators.required, Validators.min(0)]],
		imageUrl: ['']
	});

	filteredProducts = computed(() => {
		const q = this.searchQuery().toLowerCase().trim();
		if (!q) return this.products();
		return this.products().filter(p =>
			p.name.toLowerCase().includes(q) ||
			p.category?.name?.toLowerCase().includes(q)
		);
	});

	ngOnInit(): void {
		this.loadProducts();
	}

	loadProducts(): void {
		this.isLoading.set(true);
		this.productService.getProducts().subscribe({
			next: (data) => {
				this.products.set(data);
				this.isLoading.set(false);
			},
			error: () => this.isLoading.set(false)
		});
	}

	openModal(): void {
		this.productForm.reset({ price: 0 });
		this.isModalOpen.set(true);
	}

	closeModal(): void {
		this.isModalOpen.set(false);
	}

	onSaveProduct(): void {
		if (this.productForm.invalid) {
			this.productForm.markAllAsTouched();
			return;
		}

		this.isSaving.set(true);
		const newProduct = this.productForm.value as Partial<Product>;

		this.productService.createProduct(newProduct).subscribe({
			next: (createdProduct) => {
				// Actualizamos la lista local añadiendo el nuevo producto arriba
				this.products.update(current => [createdProduct, ...current]);
				this.isSaving.set(false);
				this.closeModal();
			},
			error: (err) => {
				this.isSaving.set(false);
				alert('Error al guardar el producto.');
			}
		});
	}
}