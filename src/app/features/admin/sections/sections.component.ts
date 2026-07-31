import {
    Component,
    OnInit,
    signal,
    computed,
    ViewChild,
    TemplateRef,
    AfterViewInit,
    inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDef } from '@tanstack/angular-table';
import { GenericTableComponent } from '@shared/components/generic-table/generic-table.component';
import { Section } from '@core/models/section.interface';

import { SectionModalComponent, SectionModalPayload } from './section-modal.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { SectionService } from '@core/services/section.service';

@Component({
    selector: 'app-sections',
    standalone: true,
    imports: [
        CommonModule,
        GenericTableComponent,
        SectionModalComponent,
        ConfirmModalComponent
    ],
    templateUrl: './sections.component.html'
})
export class SectionsComponent implements OnInit, AfterViewInit {
    private sectionService = inject(SectionService);

    @ViewChild('sectionTable') sectionTable!: GenericTableComponent;
    @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

    // Estado Form Modal
    isModalOpen = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    modalTitle = signal<string>('');
    editingItem = signal<Section | null>(null);

    // Estado Delete Confirm Modal
    isDeleteModalOpen = signal<boolean>(false);
    isDeleting = signal<boolean>(false);
    itemToDelete = signal<Section | null>(null);

    sectionColumns: ColumnDef<Section>[] = [
        { id: 'actions', header: '', size: 70 },
        { accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'name', header: 'SECCIÓN' }
    ];

    sectionTemplates = signal<Record<string, TemplateRef<any>>>({});

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.sectionTemplates.set({ actions: this.actionsTemplate });
    }

    // --- ACCIONES FORM MODAL ---

    onAddSection(): void {
        this.modalTitle.set('Nueva Sección');
        this.editingItem.set(null);
        this.isModalOpen.set(true);
    }

    onEditItem(item: Section): void {
        this.editingItem.set(item);
        this.modalTitle.set('Editar Sección');
        this.isModalOpen.set(true);
    }

    onSaveItem(payload: SectionModalPayload): void {
        this.isSaving.set(true);

        const request$ = payload.id
            ? this.sectionService.updateSection(payload.id, { name: payload.name })
            : this.sectionService.createSection({ name: payload.name });

        request$.subscribe({
            next: () => {
                this.isSaving.set(false);
                this.isModalOpen.set(false);
                this.refreshTable();
            },
            error: (err) => {
                console.error('Error al guardar sección:', err);
                this.isSaving.set(false);
            }
        });
    }

    // --- ACCIONES ELIMINACIÓN ---

    onDeleteItem(item: Section): void {
        this.itemToDelete.set(item);
        this.isDeleteModalOpen.set(true);
    }

    onConfirmDelete(): void {
        const item = this.itemToDelete();
        if (!item?.id) return;

        this.isDeleting.set(true);

        this.sectionService.deleteSection(item.id).subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.isDeleteModalOpen.set(false);
                this.itemToDelete.set(null);
                this.refreshTable();
            },
            error: (err) => {
                console.error('Error al eliminar sección:', err);
                this.isDeleting.set(false);
            }
        });
    }

    deleteMessage = computed(() => {
        const item = this.itemToDelete();
        return item ? `¿Estás seguro de que deseas eliminar la sección "${item.name}"?` : '';
    });

    private refreshTable(): void {
        if (this.sectionTable && typeof (this.sectionTable as any).reload === 'function') {
            (this.sectionTable as any).reload();
        }
    }
}