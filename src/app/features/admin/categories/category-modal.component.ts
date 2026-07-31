import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, Subcategory } from '@core/models/category.interface';
import { ModalComponent } from '@shared/components/modal/modal.component';

export interface CategoryModalPayload {
	id?: number;
	name: string;
	slug: string;
	parentCategoryId?: number;
}

@Component({
	selector: 'app-category-modal',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ModalComponent
	],
	templateUrl: './category-modal.component.html'
})
export class CategoryModalComponent implements OnChanges {
	private fb = inject(FormBuilder);

	@Input() isOpen = false;
	@Input() title = 'Gestionar Registro';
	@Input() item: Category | Subcategory | null = null;
	@Input() parentCategoryId: number | null = null;

	@Output() close = new EventEmitter<void>();
	@Output() save = new EventEmitter<CategoryModalPayload>();

	form: FormGroup = this.fb.group({
		id: [null],
		name: ['', [Validators.required, Validators.minLength(2)]],
		slug: ['', [Validators.required, Validators.minLength(2)]]
	});

	private isManualSlug = false;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen'] && this.isOpen) {
			this.isManualSlug = false;
			if (this.item) {
				this.form.patchValue({
					id: this.item.id,
					name: this.item.name,
					slug: this.item.slug
				});
			} else {
				this.form.reset();
			}
		}
	}

	onNameInput(): void {
		if (!this.isManualSlug) {
			const nameVal = this.form.get('name')?.value || '';
			this.form.patchValue({ slug: this.slugify(nameVal) }, { emitEvent: false });
		}
	}

	onSlugInput(): void {
		this.isManualSlug = true;
	}

	onSubmit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const formVal = this.form.value;

		const payload: CategoryModalPayload = {
			id: formVal.id ?? undefined,
			name: formVal.name.trim(),
			slug: formVal.slug.trim(),
			...(this.parentCategoryId ? { parentCategoryId: this.parentCategoryId } : {})
		};

		this.save.emit(payload);
	}

	onCloseModal(): void {
		this.close.emit();
	}

	private slugify(text: string): string {
		return text
			.toString()
			.toLowerCase()
			.trim()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9 -]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}
}