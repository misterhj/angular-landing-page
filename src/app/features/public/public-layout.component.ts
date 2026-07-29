import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
	selector: 'app-public-layout',
	standalone: true,
	imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
	template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `
})
export class PublicLayoutComponent { }