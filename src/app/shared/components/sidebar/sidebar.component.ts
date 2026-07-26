import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0">
      <!-- Logo Brand -->
      <div class="p-6 border-b border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          CZ
        </div>
        <div>
          <h2 class="font-bold text-white text-base tracking-wide leading-none">Case Zone</h2>
          <span class="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Admin Panel</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <a 
          routerLink="/admin/dashboard" 
          routerLinkActive="bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition group"
        >
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Dashboard
        </a>

        <a 
          routerLink="/admin/products" 
          routerLinkActive="bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition group"
        >
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          Productos / Fundas
        </a>
      </nav>

      <!-- User / Footer Info -->
      <div class="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Case Zone Admin v1.0
      </div>
    </aside>
  `
})
export class SidebarComponent {}