import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { User } from '@core/models/user.interface';
import { ModalComponent } from '@shared/components/modal/modal.component';

export interface UserModalPayload {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    identityDocument?: string;
    phoneNumber?: string;
    password?: string;
}

@Component({
    selector: 'app-user-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ModalComponent
    ],
    templateUrl: './user-modal.component.html'
})
export class UserModalComponent implements OnChanges {
    private fb = inject(FormBuilder);

    @Input() isOpen = false;
    @Input() title = 'Gestionar Usuario';
    @Input() item: User | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<UserModalPayload>();

    form: FormGroup = this.fb.group({
        id: [null],
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        identityDocument: [''],
        phoneNumber: [''],
        password: ['', [this.optionalMinLength(6)]]
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen) {
            if (this.item) {
                this.form.patchValue({
                    id: this.item.id,
                    firstName: this.item.firstName,
                    lastName: this.item.lastName,
                    email: this.item.email,
                    username: this.item.username,
                    identityDocument: this.item.identityDocument || '',
                    phoneNumber: this.item.phoneNumber || '',
                    password: ''
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

        const payload: UserModalPayload = {
            id: formVal.id ?? undefined,
            firstName: formVal.firstName.trim(),
            lastName: formVal.lastName.trim(),
            email: formVal.email.trim(),
            username: formVal.username.trim(),
            identityDocument: formVal.identityDocument?.trim() || undefined,
            phoneNumber: formVal.phoneNumber?.trim() || undefined,
            ...(formVal.password ? { password: formVal.password } : {})
        };

        this.save.emit(payload);
    }

    onCloseModal(): void {
        this.close.emit();
    }

    private optionalMinLength(min: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value) return null;
            return value.trim().length >= min ? null : { minlength: { requiredLength: min } };
        };
    }
}