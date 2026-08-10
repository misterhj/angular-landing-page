import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showSuccessNotification = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    identityDocument: [''],
    phoneNumber: [''],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordsMatchValidator });

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  toggleShowPassword(): void {
    this.showPassword.update(prev => !prev);
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update(prev => !prev);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.showSuccessNotification.set(false);

    const { email, firstName, lastName, username, password, identityDocument, phoneNumber, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.isLoading.set(false);
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.authService.register({
      email: email!,
      firstName: firstName!,
      lastName: lastName!,
      username: username!,
      password: password!,
      identityDocument: identityDocument || undefined,
      phoneNumber: phoneNumber || undefined
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showSuccessNotification.set(true);
        this.errorMessage.set(null);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err instanceof Error ? err.message : err?.error?.message;
        this.errorMessage.set(message || 'Ocurrió un error al registrar el usuario.');
      }
    });
  }
}