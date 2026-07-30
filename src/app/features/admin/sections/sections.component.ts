import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SectionService } from '@core/services/section.service';
import { Section } from '@core/models/section.interface';

@Component({
    selector: 'app-sections',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './sections.component.html'
})
export class SectionsComponent implements OnInit {
    private sectionService = inject(SectionService);

    sections = signal<Section[]>([]);
    newSectionName = '';

    ngOnInit(): void {
        this.loadSections();
    }

    loadSections(): void {
        this.sectionService.getSections().subscribe(data => this.sections.set(data));
    }

    createSection(): void {
        if (!this.newSectionName.trim()) return;
        this.sectionService.createSection({ name: this.newSectionName }).subscribe(() => {
            this.newSectionName = '';
            this.loadSections();
        });
    }

    deleteSection(id: number): void {
        if (confirm('¿Eliminar esta sección?')) {
            this.sectionService.deleteSection(id).subscribe(() => this.loadSections());
        }
    }
}