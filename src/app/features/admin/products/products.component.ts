import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDef } from '@tanstack/angular-table';

import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { Product } from '../../../core/models/product.interface';

@Component({
	selector: 'app-products',
	standalone: true,
	imports: [CommonModule, GenericTableComponent],
	templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {

	// Referencia a la tabla genérica para llamar a reload() cuando sea necesario
	@ViewChild(GenericTableComponent) genericTable!: GenericTableComponent<Product>;

	// Referencias a plantillas de celdas personalizadas
	@ViewChild('productCell', { static: true }) productCell!: TemplateRef<any>;
	@ViewChild('categoryCell', { static: true }) categoryCell!: TemplateRef<any>;
	@ViewChild('priceCell', { static: true }) priceCell!: TemplateRef<any>;
	@ViewChild('actionsCell', { static: true }) actionsCell!: TemplateRef<any>;

	columns: ColumnDef<Product>[] = [];
	customTemplates: Record<string, TemplateRef<any>> = {};

	ngOnInit(): void {
		this.columns = [
			{
				id: 'actions',
				header: 'Acciones',
				enableSorting: false,
				enableColumnFilter: false
			},
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				enableColumnFilter: true
			},
			{
				accessorKey: 'name',
				header: 'Producto',
				enableSorting: true,
				enableColumnFilter: true
			},
			{
				accessorKey: 'category',
				header: 'Categoría',
				enableSorting: true,
				enableColumnFilter: true
			},
			{
				accessorKey: 'brand',
				header: 'Marca',
				enableSorting: true,
				enableColumnFilter: true
			},
			{
				accessorKey: 'price',
				header: 'Precio',
				enableSorting: true,
				enableColumnFilter: false
			}
		];

		this.customTemplates = {
			actions: this.actionsCell,
			name: this.productCell,
			category: this.categoryCell,
			price: this.priceCell
		};
	}

	onCreateProduct(): void {
		console.log('Abrir formulario/modal de nuevo producto');
	}

	// Métodos de acción
	onEditProduct(product: Product): void {
		console.log('Editar producto:', product);
		// Tu lógica de abrir el modal de edición
	}

	onDeleteProduct(product: Product): void {
		if (confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
			// Llamas a tu ProductService para eliminarlo
			// Y al finalizar con éxito, refrescas la tabla:
			// this.productService.delete(product.id).subscribe(() => {
			//    this.genericTable.reload();
			// });
		}
	}
}