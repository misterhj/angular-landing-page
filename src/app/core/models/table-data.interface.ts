export interface TableQueryDto {
    procedure: string;
    pageIndex: number;
    pageSize: number;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    columnFilters?: Record<string, string | number>;
}

export interface PagedResultDto<T> {
    items: T[];
    totalCount: number; // Total de registros que coinciden con la búsqueda
    pageIndex: number;
    pageSize: number;
}