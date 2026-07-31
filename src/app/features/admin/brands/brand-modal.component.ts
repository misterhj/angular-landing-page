import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brand } from '@core/models/brand.interface';
import { Model } from '@core/models/model.interface';
import { ModalComponent } from '@shared/components/modal/modal.component';

export interface BrandModalPayload {
    id?: number;
    name: string;
    brandId?: number; // Presente si es un modelo
}

@Component({
    selector: 'app-brand-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ModalComponent
    ],
    templateUrl: './brand-modal.component.html'
})
export class BrandModalComponent implements OnChanges {
    private fb = inject(FormBuilder);

    @Input() isOpen = false;
    @Input() title = 'Gestionar Registro';
    @Input() item: Brand | Model | null = null;
    @Input() brandId: number | null = null;
    @Input() selectedBrandName: string | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<BrandModalPayload>();

    form: FormGroup = this.fb.group({
        id: [null],
        name: ['', [Validators.required, Validators.minLength(2)]]
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen) {
            if (this.item) {
                this.form.patchValue({
                    id: this.item.id,
                    name: this.item.name
                });
            } else {
                this.form.reset();
            }
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formVal = this.form.value;

        const payload: BrandModalPayload = {
            id: formVal.id ?? undefined,
            name: formVal.name.trim(),
            ...(this.brandId ? { brandId: this.brandId } : {})
        };

        this.save.emit(payload);
    }

    onCloseModal(): void {
        this.close.emit();
    }
}