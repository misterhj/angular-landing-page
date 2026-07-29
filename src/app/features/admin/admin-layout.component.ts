import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
	selector: 'app-admin-layout',
	standalone: true,
	imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
	template: `
    <div class="flex min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Content Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <app-header />

        <!-- Main Page Content -->
        <main class="flex-1 p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent { }