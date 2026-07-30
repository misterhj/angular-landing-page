import { Component, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductTableComponent } from './components/product-table/product-table.component';
import { ProductModalComponent } from './components/product-modal/product-modal.component';
import { Product } from '@core/models/product.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductTableComponent, ProductModalComponent],
  templateUrl: './products.component.html'
})
export class ProductsComponent {

  @ViewChild(ProductTableComponent) productTable!: ProductTableComponent;

  // Estados orchestrados
  isModalOpen = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);

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

    // TODO: Invocar servicio backend de productos
    // this.productService.save(productData).subscribe(() => {
    //   this.isModalOpen.set(false);
    //   this.productTable.reload();
    // });

    this.isModalOpen.set(false);
    if (this.productTable) {
      this.productTable.reload();
    }
  }

  handleDelete(product: Product): void {
    if (confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      // TODO: Invocar servicio backend de eliminación
      // this.productService.delete(product.id).subscribe(() => this.productTable.reload());
    }
  }
}