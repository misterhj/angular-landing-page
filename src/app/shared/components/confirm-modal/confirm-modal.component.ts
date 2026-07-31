import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent {
    @Input() isOpen = false;
    @Input() title = 'Confirmar Acción';
    @Input() message = '¿Estás seguro de que deseas realizar esta acción?';
    @Input() confirmText = 'Eliminar';
    @Input() cancelText = 'Cancelar';
    @Input() isLoading = false;

    @Output() cancel = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<void>();

    // 👈 Escuchamos la tecla Escape globalmente
    @HostListener('window:keydown.escape', ['$event'])
    handleEscapeKey(event: Event): void {
        // Solo cancelamos si el modal está abierto y no está ejecutando un proceso de borrado
        if (this.isOpen && !this.isLoading) {
            this.onCancel();
        }
    }

    onCancel(): void {
        if (this.isLoading) return;
        this.cancel.emit();
    }

    onConfirm(): void {
        this.confirm.emit();
    }
}