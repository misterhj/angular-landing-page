import { Component, OnInit, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Product } from '@core/models/product.interface';
import { Section } from '@core/models/section.interface';
import { Category, Subcategory } from '@core/models/category.interface';
import { Brand } from '@core/models/brand.interface';
import { Model } from '@core/models/model.interface';

import { SectionService } from '@core/services/section.service';
import { CategoryService } from '@core/services/category.service';
import { BrandService } from '@core/services/brand.service';
import { ModelService } from '@core/services/model.service';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { SearchableSelectComponent } from '@shared/components/searchable-select/searchable-select.component';

@Component({
	selector: 'app-product-modal',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ModalComponent,
		SearchableSelectComponent
	],
	templateUrl: './product-modal.component.html'
})
export class ProductModalComponent implements OnInit {
	private fb = inject(FormBuilder);

	private sectionService = inject(SectionService);
	private categoryService = inject(CategoryService);
	private brandService = inject(BrandService);
	private modelService = inject(ModelService);

	isOpen = input<boolean>(false);
	productToEdit = input<Product | null>(null);

	onClose = output<void>();
	onSave = output<any>();

	isSaving = signal<boolean>(false);
	hasImageError = false;

	// Listas dinámicas con señales
	sectionsList = signal<Section[]>([]);
	categoriesList = signal<Category[]>([]);
	subcategoriesList = signal<Subcategory[]>([]);
	brandsList = signal<Brand[]>([]);
	modelsList = signal<Model[]>([]);

	// Formulario vinculado a los IDs
	productForm: FormGroup = this.fb.group({
		id: [null],
		code: [''],
		barcode: [''],
		name: ['', [Validators.required, Validators.minLength(3)]],
		sectionId: [null],
		categoryId: [null],
		subcategoryId: [null],
		brandId: [null],
		modelId: [null],
		price: [0, [Validators.min(0)]],
		imageUrl: [''],
		description: ['']
	});

	constructor() {
		// Escuchar cambios en Categoría para actualizar Subcategorías
		this.productForm.get('categoryId')?.valueChanges.subscribe((catId) => {
			this.updateSubcategoriesList(catId);
		});

		// Escuchar cambios en Marca para actualizar Modelos
		this.productForm.get('brandId')?.valueChanges.subscribe((brandId) => {
			this.updateModelsList(brandId);
		});

		// Detectar aperturas o cambios en el producto recibido para edición
		effect(() => {
			const prod = this.productToEdit();
			const open = this.isOpen();
			this.hasImageError = false;

			if (open) {
				this.loadCatalogs();
			}

			if (prod) {
				const catId = prod.categoryId ?? prod.category?.id ?? null;
				const brandId = prod.brandId ?? prod.brand?.id ?? null;

				this.productForm.patchValue({
					id: prod.id ?? null,
					code: prod.code ?? '',
					barcode: prod.barcode ?? '',
					name: prod.name ?? '',
					sectionId: prod.sectionId ?? prod.section?.id ?? null,
					categoryId: catId,
					subcategoryId: prod.subcategoryId ?? prod.subcategory?.id ?? null,
					brandId: brandId,
					modelId: prod.modelId ?? prod.model?.id ?? null,
					price: prod.price ?? 0,
					imageUrl: prod.imageUrl ?? '',
					description: prod.description ?? ''
				});

				// Sincronizar listas secundarias
				this.updateSubcategoriesList(catId);
				this.updateModelsList(brandId);
			} else {
				this.productForm.reset({
					id: null,
					code: '',
					barcode: '',
					name: '',
					sectionId: null,
					categoryId: null,
					subcategoryId: null,
					brandId: null,
					modelId: null,
					price: 0,
					imageUrl: '',
					description: ''
				});
				this.subcategoriesList.set([]);
				this.modelsList.set([]);
			}
		});
	}

	ngOnInit(): void {
		this.loadCatalogs();
	}

	// Carga los catálogos principales desde el backend
	private loadCatalogs(): void {
		this.sectionService.getSections().subscribe({
			next: (data) => this.sectionsList.set(data),
			error: (err) => console.error('Error al cargar secciones:', err)
		});

		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categoriesList.set(data);
				const currentCatId = this.productForm.get('categoryId')?.value;
				if (currentCatId) {
					this.updateSubcategoriesList(currentCatId);
				}
			},
			error: (err) => console.error('Error al cargar categorías:', err)
		});

		this.brandService.getBrands().subscribe({
			next: (data) => {
				this.brandsList.set(data);
				const currentBrandId = this.productForm.get('brandId')?.value;
				if (currentBrandId) {
					this.updateModelsList(currentBrandId);
				}
			},
			error: (err) => console.error('Error al cargar marcas:', err)
		});
	}

	// Extrae las subcategorías en memoria
	private updateSubcategoriesList(categoryId: number | string | null): void {
		if (!categoryId) {
			this.subcategoriesList.set([]);
			return;
		}

		const selectedCat = this.categoriesList().find(c => Number(c.id) === Number(categoryId));
		const subs = selectedCat?.subcategories || [];

		this.subcategoriesList.set(subs as Subcategory[]);

		const currentSubId = this.productForm.get('subcategoryId')?.value;
		if (currentSubId && !subs.some(s => Number(s.id) === Number(currentSubId))) {
			this.productForm.patchValue({ subcategoryId: null }, { emitEvent: false });
		}
	}

	// Extrae los modelos en memoria de la marca seleccionada
	private updateModelsList(brandId: number | string | null): void {
		if (!brandId) {
			this.modelsList.set([]);
			return;
		}

		const selectedBrand = this.brandsList().find(b => Number(b.id) === Number(brandId));
		const models = selectedBrand?.models || [];

		this.modelsList.set(models);

		// Si el usuario cambia la marca y el modelo seleccionado no pertenece a la nueva marca, lo blanquea
		const currentModelId = this.productForm.get('modelId')?.value;
		if (currentModelId && !models.some(m => Number(m.id) === Number(currentModelId))) {
			this.productForm.patchValue({ modelId: null }, { emitEvent: false });
		}
	}

	onSearchSections(term: string): void {
		this.sectionService.getSections(term).subscribe({
			next: (data) => this.sectionsList.set(data),
			error: (err) => console.error('Error al buscar secciones:', err)
		});
	}

	close(): void {
		this.onClose.emit();
	}

	submitForm(): void {
		if (this.productForm.invalid) {
			this.productForm.markAllAsTouched();
			return;
		}
		this.onSave.emit(this.productForm.value);
	}
}