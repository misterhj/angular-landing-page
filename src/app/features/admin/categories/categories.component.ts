import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.interface';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
    private fb = inject(FormBuilder);
    private categoryService = inject(CategoryService);

    categories = signal<Category[]>([]);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    categoryForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        slug: ['', [Validators.required]],
        parentCategoryId: [<number | null>null]
    });

    ngOnInit(): void {
        this.loadCategories();

        // Auto-generar el slug a partir del nombre
        this.categoryForm.get('name')?.valueChanges.subscribe(name => {
            if (name) {
                const generatedSlug = name
                    .toLowerCase()
                    .trim()
                    .replace(/[\s\W-]+/g, '-');
                this.categoryForm.get('slug')?.setValue(generatedSlug, { emitEvent: false });
            }
        });
    }

    loadCategories(): void {
        this.categoryService.getCategories().subscribe({
            next: (data) => this.categories.set(data),
            error: () => this.errorMessage.set('Error al cargar las categorías.')
        });
    }

    onSubmit(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);
        this.successMessage.set(null);

        const formValue = this.categoryForm.value;
        const newCategory: Category = {
            name: formValue.name!,
            slug: formValue.slug!,
            parentCategoryId: formValue.parentCategoryId ? Number(formValue.parentCategoryId) : null
        };

        this.categoryService.createCategory(newCategory).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set('Categoría guardada exitosamente.');
                this.categoryForm.reset();
                this.loadCategories();
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err?.error?.message || 'Error al guardar la categoría.');
            }
        });
    }

    deleteCategory(id: number): void {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

        this.categoryService.deleteCategory(id).subscribe({
            next: () => this.loadCategories(),
            error: (err) => alert(err?.error?.message || 'No se pudo eliminar la categoría.')
        });
    }
}