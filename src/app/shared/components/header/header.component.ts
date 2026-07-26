import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
      <div class="flex items-center gap-2">
        <h1 class="text-sm font-medium text-slate-400">Panel de Administración</h1>
      </div>

      <div class="flex items-center gap-4">
        <!-- User Badge -->
        <div class="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
          <div class="w-7 h-7 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
            A
          </div>
          <span class="text-xs font-semibold text-slate-200 pr-1">Admin</span>
        </div>

        <!-- Logout Button -->
        <button 
          (click)="logout()" 
          title="Cerrar Sesión"
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition border border-red-500/20"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Salir
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}