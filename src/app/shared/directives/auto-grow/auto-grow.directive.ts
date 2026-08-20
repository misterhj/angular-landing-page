import { AfterViewInit, Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
	selector: '[appAutoGrow]',
	standalone: true
})
export class AutoGrowDirective implements AfterViewInit {
	@Input() appAutoGrowMaxHeight?: number;

	private readonly MIN_HEIGHT = 0;

	constructor(private elementRef: ElementRef<HTMLElement>) {}

	ngAfterViewInit(): void {
		this.resize();
	}

	@HostListener('input')
	onInput(): void {
		this.resize();
	}

	resize(): void {
		const el = this.elementRef.nativeElement;
		if (!(el instanceof HTMLTextAreaElement)) return;

		el.style.height = 'auto';

		const maxHeight = this.appAutoGrowMaxHeight
			? Math.max(this.appAutoGrowMaxHeight, this.MIN_HEIGHT)
			: Number.POSITIVE_INFINITY;

		const nextHeight = Math.min(el.scrollHeight, maxHeight);

		el.style.height = nextHeight + 'px';
		el.style.overflowY = nextHeight < el.scrollHeight ? 'auto' : 'hidden';
	}
}