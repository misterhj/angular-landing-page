import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { ModelService } from '../../../core/services/model.service';
import { SectionService } from '../../../core/services/section.service';
import { Product } from '../../../core/models/product.interface';
import { Category } from '../../../core/models/category.interface';
import { Brand } from '../../../core/models/brand.interface';
import { Model } from '../../../core/models/model.interface';
import { Section } from '../../../core/models/section.interface';

@Component({
	selector: 'app-products',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule],
	templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
	private productService = inject(ProductService);
	private categoryService = inject(CategoryService);
	private brandService = inject(BrandService);
	private modelService = inject(ModelService);
	private sectionService = inject(SectionService);
	private fb = inject(FormBuilder);

	products = signal<Product[]>([]);
	categories = signal<Category[]>([]);
	availableSubcategories = signal<Category[]>([]);
	availableBrands = signal<Brand[]>([]);
	availableModels = signal<Model[]>([]);
	availableSections = signal<Section[]>([]);

	searchQuery = signal<string>('');
	isLoading = signal<boolean>(true);

	isModalOpen = signal<boolean>(false);
	isSaving = signal<boolean>(false);
	editingProductId = signal<number | null>(null);

	productForm = this.fb.group({
		name: ['', Validators.required],
		description: [''],
		price: [0, [Validators.required, Validators.min(0)]],
		imageUrl: [''],
		categoryId: [null as number | null],
		subcategoryId: [null as number | null],
		brandId: [null as number | null],
		modelId: [null as number | null],
		sectionId: [null as number | null]
	});

	filteredProducts = computed(() => {
		const q = this.searchQuery().toLowerCase().trim();
		if (!q) return this.products();

		return this.products().filter(p =>
			p.name.toLowerCase().includes(q) ||
			p.category?.name.toLowerCase().includes(q) ||
			p.brand?.name.toLowerCase().includes(q) ||
			p.model?.name.toLowerCase().includes(q) ||
			p.section?.name.toLowerCase().includes(q)
		);
	});

	ngOnInit(): void {
		this.loadProducts();
		this.loadCatalogData();
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

	loadCatalogData(): void {
		this.categoryService.getCategories().subscribe({
			next: data => this.categories.set(data),
			error: err => console.error('Error cargando categorías:', err)
		});

		this.brandService.getBrands().subscribe({
			next: data => this.availableBrands.set(data),
			error: err => console.error('Error cargando marcas:', err)
		});

		this.sectionService.getSections().subscribe({
			next: data => this.availableSections.set(data),
			error: err => console.error('Error cargando secciones:', err)
		});
	}

	onCategoryChange(categoryId: string | number | null): void {
		if (!categoryId) {
			this.availableSubcategories.set([]);
			this.productForm.patchValue({ subcategoryId: null });
			return;
		}

		const selectedCat = this.categories().find(c => c.id === Number(categoryId));
		this.availableSubcategories.set(selectedCat?.subcategories || []);
		this.productForm.patchValue({ subcategoryId: null });
	}

	onBrandChange(brandId: number | null | undefined): void {
		this.productForm.patchValue({ modelId: null });
		this.availableModels.set([]);

		if (brandId) {
			this.modelService.getModels(Number(brandId)).subscribe(models => {
				this.availableModels.set(models);
			});
		}
	}

	openModal(): void {
		this.editingProductId.set(null);
		this.productForm.reset({ price: 0, categoryId: null, subcategoryId: null, brandId: null, modelId: null, sectionId: null });
		this.availableSubcategories.set([]);
		this.availableModels.set([]);
		this.isModalOpen.set(true);
	}

	onEditProduct(product: Product): void {
		if (!product.id) return;
		this.editingProductId.set(product.id);

		// Cargar subcategorías si tiene categoría seleccionada
		if (product.categoryId) {
			const selectedCat = this.categories().find(c => c.id === product.categoryId);
			this.availableSubcategories.set(selectedCat?.subcategories || []);
		}

		// Cargar modelos si tiene marca seleccionada
		if (product.brandId) {
			this.modelService.getModels(product.brandId).subscribe(models => this.availableModels.set(models));
		}

		this.productForm.patchValue({
			name: product.name,
			description: product.description || '',
			price: product.price,
			imageUrl: product.imageUrl || '',
			categoryId: product.categoryId || null,
			subcategoryId: product.subcategoryId || null,
			brandId: product.brandId || null,
			modelId: product.modelId || null,
			sectionId: product.sectionId || null
		});

		this.isModalOpen.set(true);
	}

	closeModal(): void {
		this.isModalOpen.set(false);
		this.editingProductId.set(null);
	}

	onSaveProduct(): void {
		if (this.productForm.invalid) {
			this.productForm.markAllAsTouched();
			return;
		}

		this.isSaving.set(true);
		const formVal = this.productForm.value;

		const payload: Partial<Product> = {
			name: formVal.name!,
			description: formVal.description || undefined,
			price: Number(formVal.price),
			imageUrl: formVal.imageUrl || undefined,
			categoryId: formVal.categoryId ? Number(formVal.categoryId) : null,
			subcategoryId: formVal.subcategoryId ? Number(formVal.subcategoryId) : null,
			brandId: formVal.brandId ? Number(formVal.brandId) : null,
			modelId: formVal.modelId ? Number(formVal.modelId) : null,
			sectionId: formVal.sectionId ? Number(formVal.sectionId) : null
		};

		const editId = this.editingProductId();

		if (editId) {
			// EDITAR PRODUCTO
			this.productService.updateProduct(editId, payload).subscribe({
				next: (updatedProduct) => {
					this.products.update(current => current.map(p => p.id === editId ? updatedProduct : p));
					this.isSaving.set(false);
					this.closeModal();
				},
				error: () => {
					this.isSaving.set(false);
					alert('Error al actualizar el producto.');
				}
			});
		} else {
			// CREAR PRODUCTO NUEVO
			this.productService.createProduct(payload).subscribe({
				next: (createdProduct) => {
					this.products.update(current => [createdProduct, ...current]);
					this.isSaving.set(false);
					this.closeModal();
				},
				error: () => {
					this.isSaving.set(false);
					alert('Error al guardar el producto.');
				}
			});
		}
	}

	onDeleteProduct(product: Product): void {
		if (!product.id) return;
		if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
			this.productService.deleteProduct(product.id).subscribe({
				next: () => {
					this.products.update(current => current.filter(p => p.id !== product.id));
				},
				error: () => alert('No se pudo eliminar el producto.')
			});
		}
	}

	// Ocultar imagen si la URL scrapeada da error 404
	onImgError(product: Product): void {
		product.imageUrl = undefined;
	}
}