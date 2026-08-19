import { Component, OnInit, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Product, ProductMedia } from '@core/models/product.interface';
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
	isSaving = input<boolean>(false);

	onClose = output<void>();
	onSave = output<any>();

	// Medios del producto (imágenes/videos)
	media = signal<ProductMedia[]>([]);
	newMediaUrl = signal<string>('');
	newMediaType = signal<'image' | 'video'>('image');

	// Especificaciones técnicas (pares clave/valor, se guardan como JSON)
	specs = signal<{ key: string; value: string }[]>([]);
	newSpecKey = signal<string>('');
	newSpecValue = signal<string>('');

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

			if (open) {
				this.loadCatalogs();
			}

			if (prod) {
				const catId = prod.categoryId ?? prod.category?.id ?? null;
				const brandId = prod.brandId ?? prod.brand?.id ?? null;

				this.media.set(prod.media && prod.media.length > 0 ? [...prod.media] : []);
				this.specs.set(this.parseSpecifications(prod.specifications));

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
					description: prod.description ?? ''
				});

				// Sincronizar listas secundarias
				this.updateSubcategoriesList(catId);
				this.updateModelsList(brandId);
			} else {
				this.media.set([]);
				this.newMediaUrl.set('');
				this.newMediaType.set('image');
				this.specs.set([]);
				this.newSpecKey.set('');
				this.newSpecValue.set('');

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
					description: ''
				});
				this.subcategoriesList.set([]);
				this.modelsList.set([]);
			}
		});
	// Habilitar/deshabilitar el formulario mientras se guarda
		effect(() => {
			const saving = this.isSaving();
			if (saving) {
				this.productForm.disable();
			} else {
				this.productForm.enable();
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

	// Agrega un nuevo medio (imagen/video) al listado
	addMedia(): void {
		const url = this.newMediaUrl().trim();
		if (!url) return;

		const isFirst = this.media().length === 0;

		this.media.update(list => [
			...list,
			{ url, mediaType: this.newMediaType(), isPrimary: isFirst }
		]);

		this.newMediaUrl.set('');
	}

	// Elimina un medio por índice; si se eliminaba el principal, el primero pasa a serlo
	removeMedia(index: number): void {
		this.media.update(list => {
			const next = list.filter((_, i) => i !== index);
			if (next.length > 0 && !next.some(m => m.isPrimary)) {
				next[0].isPrimary = true;
			}
			return next;
		});
	}

	// Marca el medio indicado como principal
	setPrimaryMedia(index: number): void {
		this.media.update(list => list.map((m, i) => ({ ...m, isPrimary: i === index })));
	}

	// Oculta la previsualización si la URL no carga
	onMediaPreviewError(event: Event): void {
		(event.target as HTMLElement).style.display = 'none';
	}

	// Convierte el JSON de specifications en pares clave/valor
	private parseSpecifications(raw: unknown): { key: string; value: string }[] {
		if (!raw) return [];

		const rows: { key: string; value: string }[] = [];
		const pushObj = (obj: unknown): void => {
			if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
				for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
					rows.push({ key: k, value: String(v) });
				}
			}
		};

		// Si ya viene como objeto/array parseado, lo usamos directamente
		if (typeof raw === 'object' && !Array.isArray(raw)) {
			pushObj(raw);
			return rows;
		}
		if (Array.isArray(raw)) {
			raw.forEach(pushObj);
			return rows;
		}

		const text = String(raw).trim();
		if (!text) return rows;

		try {
			const parsed: unknown = JSON.parse(text);
			if (Array.isArray(parsed)) {
				parsed.forEach(pushObj);
				return rows;
			}
			pushObj(parsed);
			return rows;
		} catch { /* no es un JSON único */ }

		for (const line of text.split(/\r?\n/)) {
			const l = line.trim();
			if (!l) continue;
			try {
				pushObj(JSON.parse(l));
			} catch {
				rows.push({ key: '', value: l });
			}
		}
		return rows;
	}

	// Serializa los pares clave/valor a un objeto JSON
	private serializeSpecifications(rows: { key: string; value: string }[]): string {
		const obj: Record<string, string> = {};
		for (const r of rows) {
			const key = r.key.trim();
			if (key) obj[key] = r.value;
		}
		return JSON.stringify(obj);
	}

	// Agrega una especificación al listado
	addSpec(): void {
		const key = this.newSpecKey().trim();
		const value = this.newSpecValue().trim();
		if (!key && !value) return;

		this.specs.update(list => [...list, { key, value }]);
		this.newSpecKey.set('');
		this.newSpecValue.set('');
	}

	// Elimina una especificación por índice
	removeSpec(index: number): void {
		this.specs.update(list => list.filter((_, i) => i !== index));
	}

	submitForm(): void {
		if (this.productForm.invalid) {
			this.productForm.markAllAsTouched();
			return;
		}
		const specifications = this.serializeSpecifications(this.specs());
		this.onSave.emit({ ...this.productForm.value, specifications, media: this.media() });
	}
}