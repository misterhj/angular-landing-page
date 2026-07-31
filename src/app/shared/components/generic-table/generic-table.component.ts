import {
    Component,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    inject,
    signal,
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

@Component({
    selector: 'app-generic-table',
    standalone: true,
    imports: [CommonModule, FormsModule, FlexRenderDirective],
    templateUrl: './generic-table.component.html'
})
export class GenericTableComponent<T = any> {
    private dataService = inject(TableDataService);

    @Input({ required: true }) procedure!: string;
    @Input({ required: true }) columns: ColumnDef<T>[] = [];

    customTemplates = input<Record<string, TemplateRef<any>>>({});

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

        const filterMap: Record<string, string> = {};

        const rawDefaults = this.defaultFilters();
        Object.entries(rawDefaults).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                filterMap[key] = val;
            }
        });

        this.columnFilters().forEach(f => {
            if (f.value !== undefined && f.value !== null && f.value !== '') {
                filterMap[f.id] = String(f.value);
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

    updateColumnFilter(columnId: string, event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.table.getColumn(columnId)?.setFilterValue(value);
    }

    reload(): void {
        this.fetchServerData();
    }
}