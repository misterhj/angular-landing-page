import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Settings } from '@core/models/settings.interface';
import { ModalComponent } from '@shared/components/modal/modal.component';

export interface SettingsModalPayload {
    id?: number;
    key: string;
    value: string;
    description?: string;
}

@Component({
    selector: 'app-settings-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ModalComponent
    ],
    templateUrl: './settings-modal.component.html'
})
export class SettingsModalComponent implements OnChanges {
    private fb = inject(FormBuilder);

    @Input() isOpen = false;
    @Input() title = 'Gestionar Configuración';
    @Input() item: Settings | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<SettingsModalPayload>();

    form: FormGroup = this.fb.group({
        id: [null],
        key: ['', [Validators.required, Validators.minLength(2)]],
        value: ['', [Validators.required]],
        description: ['']
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen) {
            if (this.item) {
                this.form.patchValue({
                    id: this.item.id,
                    key: this.item.key,
                    value: this.item.value,
                    description: this.item.description
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

        const payload: SettingsModalPayload = {
            id: formVal.id ?? undefined,
            key: formVal.key.trim(),
            value: formVal.value.trim(),
            description: formVal.description?.trim() || undefined
        };

        this.save.emit(payload);
    }

    onCloseModal(): void {
        this.close.emit();
    }
}