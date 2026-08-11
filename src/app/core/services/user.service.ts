import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/users`;

	getUsers(): Observable<User[]> {
		return this.http.get<User[]>(this.API_URL);
	}

	updateUser(id: number, user: Partial<User>): Observable<User> {
		return this.http.put<User>(`${this.API_URL}/${id}`, user);
	}

	deleteUser(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}
}