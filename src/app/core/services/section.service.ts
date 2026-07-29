import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Section } from '../models/section.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private http = inject(HttpClient);
    private API_URL = `${environment.apiUrl}/auth`;

  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(this.API_URL);
  }

  createSection(section: Partial<Section>): Observable<Section> {
    return this.http.post<Section>(this.API_URL, section);
  }

  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}