import {
    Component,
    ElementRef,
    HostListener,
    Input,
    Output,
    EventEmitter,
    forwardRef,
    signal,
    computed,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface SelectOption {
    id?: number | string;
    name: string;
}

@Component({
    selector: 'app-searchable-select',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchableSelectComponent),
            multi: true
        }
    ],
    template: `
    <div class="relative w-full">
      <div class="relative flex items-center">
        <input
          #searchInput
          type="text"
          [placeholder]="placeholder"
          [value]="isOpen() ? searchTerm() : selectedLabel()"
          (focus)="onFocus()"
          (input)="onInput($event)"
          (keydown)="onKeyDown($event)"
          [disabled]="disabled"
          class="w-full px-3 py-2 pr-8 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <button 
          type="button"
          (click)="toggleOpen($event)"
          [disabled]="disabled"
          tabindex="-1"
          class="absolute right-2 text-slate-400 hover:text-slate-200 focus:outline-none">
          <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="isOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div 
        #dropdownList
        *ngIf="isOpen()" 
        class="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-52 overflow-y-auto left-0">
        
        <!-- Opción Sin seleccionar (index -1) -->
        <div 
          [id]="'opt-null'"
          (click)="selectOption(null)" 
          [class.bg-slate-700]="focusedIndex() === -1"
          class="px-3 py-2 text-xs text-slate-400 hover:bg-slate-700/60 cursor-pointer border-b border-slate-700/50 transition-colors">
          -- Sin seleccionar --
        </div>

        <!-- Lista de Opciones -->
        <div 
          *ngFor="let opt of filteredOptions(); let i = index" 
          [id]="'opt-' + i"
          (click)="selectOption(opt)"
          [class.bg-slate-700]="focusedIndex() === i && opt.id !== selectedValue()"
          [class.bg-blue-600/30]="opt.id === selectedValue()"
          [class.text-blue-400]="opt.id === selectedValue()"
          class="px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer flex items-center justify-between transition-colors">
          <span>{{ opt.name }}</span>
          <span *ngIf="opt.id === selectedValue()" class="text-blue-400 text-xs font-bold">✓</span>
        </div>

        <div *ngIf="filteredOptions().length === 0" class="px-3 py-2 text-xs text-slate-500 text-center">
          No se encontraron resultados
        </div>
      </div>
    </div>
  `
})
export class SearchableSelectComponent implements ControlValueAccessor {
    // Signal reactivo interno para rastrear los cambios de options
    optionsSignal = signal<SelectOption[]>([]);

    @Input() set options(val: SelectOption[]) {
        this.optionsSignal.set(val || []);
    }
    get options(): SelectOption[] {
        return this.optionsSignal();
    }

    @Input() placeholder: string = 'Seleccionar...';
    @Input() disabled: boolean = false;
    @Input() isRemote: boolean = false;
    @Output() onSearch = new EventEmitter<string>();

    @ViewChild('dropdownList') dropdownList?: ElementRef<HTMLDivElement>;

    private searchSubject = new Subject<string>();

    searchTerm = signal<string>('');
    isOpen = signal<boolean>(false);
    selectedValue = signal<any>(null);

    focusedIndex = signal<number>(-1);

    filteredOptions = computed(() => {
        const opts = this.optionsSignal();
        if (this.isRemote) return opts;
        const term = this.searchTerm().toLowerCase().trim();
        if (!term) return opts;
        return opts.filter(opt => opt.name.toLowerCase().includes(term));
    });

    selectedLabel = computed(() => {
        const opts = this.optionsSignal();
        const found = opts.find(opt => opt.id === this.selectedValue());
        return found ? found.name : '';
    });

    onChange: any = () => { };
    onTouched: any = () => { };

    constructor(private elementRef: ElementRef) {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(term => {
            this.onSearch.emit(term);
        });
    }

    writeValue(val: any): void {
        this.selectedValue.set(val);
    }

    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void { this.onTouched = fn; }
    setDisabledState?(isDisabled: boolean): void { this.disabled = isDisabled; }

    onFocus(): void {
        if (this.disabled) return;
        this.searchTerm.set('');
        this.focusedIndex.set(-1);
        this.isOpen.set(true);
        if (this.isRemote) {
            this.searchSubject.next('');
        }
    }

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchTerm.set(value);

        this.focusedIndex.set(0);

        if (!this.isOpen()) this.isOpen.set(true);

        if (this.isRemote) {
            this.searchSubject.next(value);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.isOpen()) {
            if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
                this.isOpen.set(true);
                event.preventDefault();
            }
            return;
        }

        const total = this.filteredOptions().length;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (this.focusedIndex() < total - 1) {
                    this.focusedIndex.update(idx => idx + 1);
                    this.scrollToFocused();
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                if (this.focusedIndex() > -1) {
                    this.focusedIndex.update(idx => idx - 1);
                    this.scrollToFocused();
                }
                break;

            case 'Enter':
                event.preventDefault();
                if (this.focusedIndex() === -1) {
                    this.selectOption(null);
                } else if (this.focusedIndex() >= 0 && this.focusedIndex() < total) {
                    this.selectOption(this.filteredOptions()[this.focusedIndex()]);
                }
                break;

            case 'Escape':
            case 'Tab':
                this.isOpen.set(false);
                break;
        }
    }

    toggleOpen(event: MouseEvent): void {
        event.stopPropagation();
        if (this.disabled) return;
        if (this.isOpen()) {
            this.isOpen.set(false);
        } else {
            this.searchTerm.set('');
            this.focusedIndex.set(-1);
            this.isOpen.set(true);
            if (this.isRemote) {
                this.searchSubject.next('');
            }
        }
    }

    selectOption(option: SelectOption | null): void {
        const val = option ? option.id : null;
        this.selectedValue.set(val);
        this.onChange(val);
        this.onTouched();
        this.isOpen.set(false);
        this.searchTerm.set('');
        this.focusedIndex.set(-1);
    }

    private scrollToFocused(): void {
        setTimeout(() => {
            if (!this.dropdownList) return;
            const targetId = this.focusedIndex() === -1 ? 'opt-null' : `opt-${this.focusedIndex()}`;
            const element = this.dropdownList.nativeElement.querySelector(`#${targetId}`);
            if (element) {
                element.scrollIntoView({ block: 'nearest' });
            }
        }, 0);
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }
}