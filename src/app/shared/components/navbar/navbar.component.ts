import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
            CZ
          </div>
          <span class="font-bold text-lg text-white tracking-wide">Case Zone</span>
        </a>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a routerLink="/" routerLinkActive="text-blue-400 font-semibold" [routerLinkActiveOptions]="{exact: true}" class="hover:text-white transition">Inicio</a>
          <a routerLink="/catalog" routerLinkActive="text-blue-400 font-semibold" class="hover:text-white transition">Catálogo</a>
          <a href="#destacados" class="hover:text-white transition">Populares</a>
        </nav>

        <!-- Admin Shortcut / Call to Action -->
        <div class="flex items-center gap-4">
          <a routerLink="/login" class="text-xs text-slate-400 hover:text-white transition hidden sm:block">
            Panel Admin
          </a>
          <a routerLink="/catalog" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition">
            Ver Productos
          </a>
        </div>

      </div>
    </header>
  `
})
export class NavbarComponent {}