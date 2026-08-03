import { Component, ViewChild, TemplateRef, OnInit, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDef } from '@tanstack/angular-table';

import { GenericTableComponent, SelectFilterConfig } from '@shared/components/generic-table/generic-table.component';
import { SectionService } from '@core/services/section.service';
import { CategoryService } from '@core/services/category.service';
import { BrandService } from '@core/services/brand.service';
import { ModelService } from '@core/services/model.service';
import { Product } from '@core/models/product.interface';

@Component({
	selector: 'app-product-table',
	standalone: true,
	imports: [CommonModule, GenericTableComponent],
	templateUrl: './product-table.component.html'
})
export class ProductTableComponent implements OnInit {

	private sectionService = inject(SectionService);
	private categoryService = inject(CategoryService);
	private brandService = inject(BrandService);
	private modelService = inject(ModelService);

	@ViewChild(GenericTableComponent) private genericTable!: GenericTableComponent<Product>;

	@ViewChild('productCell', { static: true }) productCell!: TemplateRef<any>;
	@ViewChild('sectionCell', { static: true }) sectionCell!: TemplateRef<any>;
	@ViewChild('categoryCell', { static: true }) categoryCell!: TemplateRef<any>;
	@ViewChild('subcategoryCell', { static: true }) subcategoryCell!: TemplateRef<any>;
	@ViewChild('brandCell', { static: true }) brandCell!: TemplateRef<any>;
	@ViewChild('modelCell', { static: true }) modelCell!: TemplateRef<any>;
	@ViewChild('priceCell', { static: true }) priceCell!: TemplateRef<any>;
	@ViewChild('actionsCell', { static: true }) actionsCell!: TemplateRef<any>;

	// Outputs para avisar al contenedor
	onEdit = output<Product>();
	onDelete = output<Product>();
	onCreate = output<void>();

	columns: ColumnDef<Product>[] = [];
	customTemplates: Record<string, TemplateRef<any>> = {};
	selectFilters = signal<Record<string, SelectFilterConfig>>({});

	ngOnInit(): void {

		this.columns = [
			{ id: 'actions', header: 'Acciones', size: 120, enableSorting: false, enableColumnFilter: false },
			{ accessorKey: 'id', header: 'ID', size: 60, enableSorting: true, enableColumnFilter: true },
			{ accessorKey: 'name', header: 'Producto', size: 250, enableSorting: true, enableColumnFilter: true },
			{ accessorKey: 'section', header: 'Sección', size: 140, enableSorting: true, enableColumnFilter: true },
			{ accessorKey: 'category', header: 'Categoría', size: 160, enableSorting: true, enableColumnFilter: true },
			{ accessorKey: 'subcategory', header: 'Subcategoría', size: 140, enableSorting: true, enableColumnFilter: true },
			{ accessorKey: 'brand', header: 'Marca', size: 120, enableSorting: true, enableColumnFilter: true },
			{ accessorKey: 'model', header: 'Modelo', size: 120, enableSorting: true, enableColumnFilter: true },
			{ accessorKey: 'price', header: 'Precio', size: 120, enableSorting: true, enableColumnFilter: false }
		];

		this.customTemplates = {
			actions: this.actionsCell,
			name: this.productCell,
			section: this.sectionCell,
			category: this.categoryCell,
			subcategory: this.subcategoryCell,
			brand: this.brandCell,
			model: this.modelCell,
			price: this.priceCell
		};

		this.loadFilterOptions();
	}

	// Carga las opciones para los filtros tipo Select
	private loadFilterOptions(): void {
		this.sectionService.getSections().subscribe({
			next: (sections) => this.selectFilters.update(config => ({
				...config,
				section: { options: sections, placeholder: 'Filtrar por sección...', filterKey: 'sectionId', numeric: true }
			})),
			error: (err) => console.error('Error al cargar secciones para filtro:', err)
		});

		this.categoryService.getCategories().subscribe({
			next: (categories) => this.selectFilters.update(config => ({
				...config,
				category: { options: categories, placeholder: 'Filtrar por categoría...', filterKey: 'categoryId', numeric: true }
			})),
			error: (err) => console.error('Error al cargar categorías para filtro:', err)
		});

		this.brandService.getBrands().subscribe({
			next: (brands) => this.selectFilters.update(config => ({
				...config,
				brand: { options: brands, placeholder: 'Filtrar por marca...', filterKey: 'brandId', numeric: true }
			})),
			error: (err) => console.error('Error al cargar marcas para filtro:', err)
		});

		this.categoryService.getSubcategories().subscribe({
			next: (subcategories) => this.selectFilters.update(config => ({
				...config,
				subcategory: { options: subcategories, placeholder: 'Filtrar por subcategoría...', filterKey: 'subcategoryId', numeric: true }
			})),
			error: (err) => console.error('Error al cargar subcategorías para filtro:', err)
		});

		this.modelService.getModels().subscribe({
			next: (models) => this.selectFilters.update(config => ({
				...config,
				model: { options: models, placeholder: 'Filtrar por modelo...', filterKey: 'modelId', numeric: true }
			})),
			error: (err) => console.error('Error al cargar modelos para filtro:', err)
		});
	}

	// Método público para recargar la tabla tras guardar/eliminar
	reload(): void {
		if (this.genericTable) {
			this.genericTable.reload();
		}
	}
}