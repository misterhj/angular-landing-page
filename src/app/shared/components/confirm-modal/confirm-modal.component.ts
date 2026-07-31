import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule, ModalComponent],
    templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent {
    isOpen = input<boolean>(false);
    title = input<string>('Confirmar Acción');
    message = input<string>('');
    confirmText = input<string>('Eliminar');
    cancelText = input<string>('Cancelar');
    isLoading = input<boolean>(false);

    cancel = output<void>();
    confirm = output<void>();
}