import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // <-- Importamos RouterLink
import { AuthService } from '@core/services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, RouterLink], // <-- Agregado RouterLink
	templateUrl: './login.component.html'
})
export class LoginComponent {
	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	private router = inject(Router);

	isLoading = signal(false);
	errorMessage = signal<string | null>(null);
	notificationMessage = signal<string | null>(null);

	// Señal para controlar la visibilidad del password
	showPassword = signal(false);

	loginForm = this.fb.group({
		username: ['', [Validators.required]],
		password: ['', [Validators.required, Validators.minLength(6)]]
	});

	// Método para alternar el estado (true / false)
	toggleShowPassword(): void {
		this.showPassword.update(prev => !prev);
	}

	onSubmit(): void {
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);
		this.errorMessage.set(null);
		this.notificationMessage.set(null);

		const { username, password } = this.loginForm.value;

		this.authService.login({ username: username!, password: password! }).subscribe({
			next: (response) => {
				this.isLoading.set(false);
				if (response?.message) {
					this.notificationMessage.set(response.message);
				}
				this.router.navigate(['/admin/dashboard']);
			},
			error: (err) => {
				this.isLoading.set(false);
				const message = err instanceof Error ? err.message : err;
				this.errorMessage.set(message || 'Credenciales erróneas o fallo de conexión.');
			}
		});
	}
}