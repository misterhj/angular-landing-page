import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { FooterComponent } from '@shared/components/footer/footer.component';

@Component({
	selector: 'app-public-layout',
	standalone: true,
	imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
	template: `
    <div class="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
      <app-navbar />
      <main class="flex-1 pt-32 sm:pt-36 lg:pt-24">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `
})
export class PublicLayoutComponent { }