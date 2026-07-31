import { Component, ViewChild, TemplateRef, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDef } from '@tanstack/angular-table';

import { GenericTableComponent } from '@shared/components/generic-table/generic-table.component';
import { Product } from '@core/models/product.interface';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, GenericTableComponent],
  templateUrl: './product-table.component.html'
})
export class ProductTableComponent implements OnInit {

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

  ngOnInit(): void {
    this.columns = [
      { id: 'actions', header: 'Acciones', enableSorting: false, enableColumnFilter: false },
      { accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'name', header: 'Producto', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'section', header: 'Sección', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'category', header: 'Categoría', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'subcategory', header: 'Subcategoría', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'brand', header: 'Marca', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'model', header: 'Modelo', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'price', header: 'Precio', enableSorting: true, enableColumnFilter: false }
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
  }

  // Método público para recargar la tabla tras guardar/eliminar
  reload(): void {
    if (this.genericTable) {
      this.genericTable.reload();
    }
  }
}