import {
    Component,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    inject,
    signal,
    computed,
    effect,
    input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    createAngularTable,
    getCoreRowModel,
    FlexRenderDirective,
    ColumnDef,
    PaginationState,
    SortingState,
    ColumnFiltersState
} from '@tanstack/angular-table';

import { TableDataService } from '@core/services/table-data.service';
import { TableQueryDto } from '@core/models/table-data.interface';

import { SearchableSelectComponent, SelectOption } from '@shared/components/searchable-select/searchable-select.component';

export interface SelectFilterConfig {
    options: SelectOption[];
    placeholder?: string;
    // Clave con la que se enviará el filtro al API (por defecto usa el id de la columna)
    filterKey?: string;
    // Envía el valor como número (para IDs de otras tablas: sectionId, categoryId, etc.)
    numeric?: boolean;
}

@Component({
    selector: 'app-generic-table',
    standalone: true,
    imports: [CommonModule, FormsModule, FlexRenderDirective, SearchableSelectComponent],
    templateUrl: './generic-table.component.html'
})
export class GenericTableComponent<T = any> {
    private dataService = inject(TableDataService);

    @Input({ required: true }) procedure!: string;
    @Input({ required: true }) columns: ColumnDef<T>[] = [];

    customTemplates = input<Record<string, TemplateRef<any>>>({});

    // Configuración opcional para renderizar filtros tipo Select en ciertas columnas
    selectFilters = input<Record<string, SelectFilterConfig>>({});

    @Input() title: string = '';
    @Input() showAddButton: boolean = true;
    
    defaultFilters = input<Record<string, string | undefined>>({});

    @Output() addClicked = new EventEmitter<void>();
    @Output() rowClick = new EventEmitter<T>();

    data = signal<T[]>([]);
    totalCount = signal<number>(0);
    isLoading = signal<boolean>(false);

    pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });
    sorting = signal<SortingState>([]);
    columnFilters = signal<ColumnFiltersState>([]);

    // Indica si hay filtros activos aplicados por el usuario
    hasActiveFilters = computed(() => this.columnFilters().length > 0);

    // Controla la visibilidad de los filtros (ocultos por defecto)
    showFilters = signal<boolean>(false);

    // Texto tipeado en los filtros de texto que aún no se ha aplicado
    pendingTextFilters = signal<Record<string, string>>({});

    table = createAngularTable(() => ({
        data: this.data(),
        columns: this.columns,
        pageCount: Math.ceil(this.totalCount() / this.pagination().pageSize) || 1,
        
        // 👈 HABILITAMOS EL RESIZE DE COLUMNAS
        enableColumnResizing: true,
        columnResizeMode: 'onChange',

        state: {
            pagination: this.pagination(),
            sorting: this.sorting(),
            columnFilters: this.columnFilters()
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        onPaginationChange: updater => this.pagination.update(old => typeof updater === 'function' ? updater(old) : updater),
        onSortingChange: updater => this.sorting.update(old => typeof updater === 'function' ? updater(old) : updater),
        onColumnFiltersChange: updater => this.columnFilters.update(old => typeof updater === 'function' ? updater(old) : updater),
        getCoreRowModel: getCoreRowModel()
    }));

    constructor() {
        effect(() => {
            this.fetchServerData();
        });
    }

    fetchServerData(): void {
        if (!this.procedure) return;
        this.isLoading.set(true);

        const filterMap: Record<string, string | number> = {};

        const rawDefaults = this.defaultFilters();
        Object.entries(rawDefaults).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                filterMap[key] = val;
            }
        });

        this.columnFilters().forEach(f => {
            if (f.value !== undefined && f.value !== null && f.value !== '') {
                const config = this.selectFilters()[f.id];
                const key = config?.filterKey ?? f.id;
                filterMap[key] = config?.numeric ? Number(f.value) : String(f.value);
            }
        });

        const activeSort = this.sorting()[0];

        const payload: TableQueryDto = {
            procedure: this.procedure,
            pageIndex: this.pagination().pageIndex,
            pageSize: this.pagination().pageSize,
            sortColumn: activeSort?.id,
            sortDirection: activeSort ? (activeSort.desc ? 'desc' : 'asc') : undefined,
            columnFilters: filterMap
        };

        this.dataService.fetchData<T>(payload).subscribe({
            next: res => {
                this.data.set(res.items);
                this.totalCount.set(res.totalCount);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    // Guarda el texto tipeado en el filtro de texto sin aplicar la consulta
    onTextFilterInput(columnId: string, event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.pendingTextFilters.update(prev => ({ ...prev, [columnId]: value }));
    }

    // Aplica el filtro de texto al presionar Enter
    applyTextFilter(columnId: string): void {
        const value = this.pendingTextFilters()[columnId] ?? '';
        if (this.table.getState().pagination.pageIndex !== 0) {
            this.table.setPageIndex(0);
        }
        this.table.getColumn(columnId)?.setFilterValue(value === '' ? null : value);
    }

    // Aplica todos los filtros de texto pendientes (botón de búsqueda)
    applyPendingTextFilters(): void {
        if (this.table.getState().pagination.pageIndex !== 0) {
            this.table.setPageIndex(0);
        }
        this.table.setColumnFilters(prev => {
            const nonText = prev.filter(f => !this.selectFilters()[f.id]);
            const pending: ColumnFiltersState = [];
            Object.entries(this.pendingTextFilters()).forEach(([id, value]) => {
                pending.push({ id, value: value === '' ? null : value });
            });
            return [...nonText, ...pending];
        });
    }

    updateSelectFilter(columnId: string, value: any): void {
        // Al filtrar desde un Select volvemos a la primera página
        if (this.table.getState().pagination.pageIndex !== 0) {
            this.table.setPageIndex(0);
        }
        this.table.getColumn(columnId)?.setFilterValue(value);
    }

    clearFilters(): void {
        this.pendingTextFilters.set({});
        this.table.resetColumnFilters();
    }

    reload(): void {
        this.fetchServerData();
    }
}