import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-t border-slate-200 text-slate-500 text-sm py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center font-bold text-white text-xs">
            CS
          </div>
          <span class="font-semibold text-slate-900">Cute Store</span>
          <span class="text-xs text-slate-400">© 2026 Todos los derechos reservados.</span>
        </div>

        <div class="flex gap-6 text-xs text-slate-500">
          <a href="#" class="hover:text-slate-900 transition">Términos y Condiciones</a>
          <a href="#" class="hover:text-slate-900 transition">Política de Privacidad</a>
          <a href="#" class="hover:text-slate-900 transition">Soporte</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}