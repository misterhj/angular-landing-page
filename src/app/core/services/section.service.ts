import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Section } from '../models/section.interface';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class SectionService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/sections`;

	getSections(): Observable<Section[]> {
		return this.http.get<Section[]>(this.API_URL);
	}

	createSection(section: Partial<Section>): Observable<Section> {
		return this.http.post<Section>(this.API_URL, section);
	}

	updateSection(id: number, section: Partial<Section>): Observable<Section> {
		return this.http.put<Section>(`${this.API_URL}/${id}`, section);
	}

	deleteSection(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}
}