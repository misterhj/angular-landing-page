import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
            CZ
          </div>
          <span class="font-semibold text-white">Case Zone</span>
          <span class="text-xs text-slate-500">© 2026 Todos los derechos reservados.</span>
        </div>

        <div class="flex gap-6 text-xs text-slate-400">
          <a href="#" class="hover:text-white transition">Términos y Condiciones</a>
          <a href="#" class="hover:text-white transition">Política de Privacidad</a>
          <a href="#" class="hover:text-white transition">Soporte</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}