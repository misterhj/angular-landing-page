import { Component, HostListener, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  // Configuración
  isOpen = input<boolean>(false);
  title = input<string>('');
  maxWidthClass = input<string>('max-w-md'); // Permite ajustar el ancho (max-w-md, max-w-2xl, etc.)
  closeOnBackdrop = input<boolean>(true);
  closeOnEscape = input<boolean>(true);

  // Evento de cierre
  close = output<void>();

  // Cierre por tecla Escape
  @HostListener('window:keydown.escape')
  handleEscapeKey(): void {
    if (this.isOpen() && this.closeOnEscape()) {
      this.close.emit();
    }
  }

  // Cierre por clic en el fondo oscuro (Backdrop)
  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.closeOnBackdrop() && target.classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}