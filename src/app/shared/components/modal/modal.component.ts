import { Component, ElementRef, HostListener, ViewChild, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-modal',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './modal.component.html'
})
export class ModalComponent {
	isOpen = input<boolean>(false);
	title = input<string>('');
	maxWidthClass = input<string>('max-w-md');
	closeOnBackdrop = input<boolean>(true);
	closeOnEscape = input<boolean>(true);

	close = output<void>();

	// 👈 Referencia al botón 'X'
	@ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

	constructor() {
		// 👈 Cada vez que el modal se abre, le da foco al botón X
		effect(() => {
			if (this.isOpen()) {
				setTimeout(() => {
					this.closeBtn?.nativeElement?.focus();
				}, 50); // Le pequeño margen para dar tiempo a que el *ngIf monte el DOM
			}
		});
	}

	@HostListener('window:keydown.escape')
	handleEscapeKey(): void {
		if (this.isOpen() && this.closeOnEscape()) {
			this.close.emit();
		}
	}

	onBackdropClick(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		if (this.closeOnBackdrop() && target.classList.contains('modal-backdrop')) {
			this.close.emit();
		}
	}
}