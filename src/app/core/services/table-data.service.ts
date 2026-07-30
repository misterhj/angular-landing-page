import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TableQueryDto, PagedResultDto } from '../models/table-data.model';

@Injectable({
    providedIn: 'root'
})
export class TableDataService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/data/query`;

    fetchData<T>(query: TableQueryDto): Observable<PagedResultDto<T>> {
        return this.http.post<PagedResultDto<T>>(this.apiUrl, query);
    }
}