import { Component, OnInit, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '@core/models/product.interface';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-modal.component.html'
})
export class ProductModalComponent implements OnInit {
  private fb = inject(FormBuilder);

  // Inputs y Outputs con la API moderna de Signals de Angular
  isOpen = input<boolean>(false);
  productToEdit = input<Product | null>(null);
  
  onClose = output<void>();
  onSave = output<any>();

  isSaving = signal<boolean>(false);

  // Listas de opciones para los selectores
  sectionsList = signal<string[]>(['Electrónica y Tecnología', 'Hogar y Electrodomésticos', 'Accesorios']);
  categoriesList = signal<string[]>(['televisores-y-audio', 'celulares-y-tablets', 'informática']);
  subcategoriesList = signal<string[]>(['Smart TV', 'Radio Portátil', 'Media Player', 'Audio']);
  brandsList = signal<string[]>(['Samsung', 'Xion', 'Amazon', 'Win', 'LG']);
  modelsList = signal<string[]>(['XI-RA28BT', 'XI-RA12', 'Fire TV Stick 4K', 'UN43CU7090GXPR']);

  productForm: FormGroup = this.fb.group({
    id: [null],
    name: ['', [Validators.required, Validators.minLength(3)]],
    section: ['', Validators.required],
    category: ['', Validators.required],
    subcategory: [''],
    brand: [''],
    model: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    description: ['']
  });

  constructor() {
    // Reacciona cuando cambia el producto a editar
    effect(() => {
      const prod = this.productToEdit();
      if (prod) {
        this.productForm.patchValue({
          id: prod.id,
          name: prod.name,
          section: (prod as any).section || '',
          category: typeof prod.category === 'object' ? (prod.category as any)?.name : (prod.category || ''),
          subcategory: (prod as any).subcategory || '',
          brand: prod.brand || '',
          model: (prod as any).model || '',
          price: prod.price,
          imageUrl: prod.imageUrl || '',
          description: prod.description || ''
        });
      } else {
        this.productForm.reset({ id: null, section: '', category: '', subcategory: '', brand: '', model: '', price: 0 });
      }
    });
  }

  ngOnInit(): void {}

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