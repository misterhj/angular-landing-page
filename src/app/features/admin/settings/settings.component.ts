import {
    Component,
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
import { Settings } from '@core/models/settings.interface';

import { SettingsModalComponent, SettingsModalPayload } from './settings-modal.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { SettingsService } from '@core/services/settings.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        GenericTableComponent,
        SettingsModalComponent,
        ConfirmModalComponent
    ],
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements AfterViewInit {
    private settingsService = inject(SettingsService);

    @ViewChild('settingsTable') settingsTable!: GenericTableComponent;
    @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

    // Estado Form Modal
    isModalOpen = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    modalTitle = signal<string>('');
    editingItem = signal<Settings | null>(null);

    // Estado Delete Confirm Modal
    isDeleteModalOpen = signal<boolean>(false);
    isDeleting = signal<boolean>(false);
    itemToDelete = signal<Settings | null>(null);

    settingsColumns: ColumnDef<Settings>[] = [
        { id: 'actions', header: '', size: 70 },
        { accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'key', header: 'CLAVE', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'value', header: 'VALOR', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'description', header: 'DESCRIPCIÓN', enableSorting: true, enableColumnFilter: true }
    ];

    settingsTemplates = signal<Record<string, TemplateRef<any>>>({});

    ngAfterViewInit(): void {
        this.settingsTemplates.set({ actions: this.actionsTemplate });
    }

    // --- ACCIONES FORM MODAL ---

    onAddSettings(): void {
        this.modalTitle.set('Nueva Configuración');
        this.editingItem.set(null);
        this.isModalOpen.set(true);
    }

    onEditItem(item: Settings): void {
        this.editingItem.set(item);
        this.modalTitle.set('Editar Configuración');
        this.isModalOpen.set(true);
    }

    onSaveItem(payload: SettingsModalPayload): void {
        this.isSaving.set(true);

        const request$ = payload.id
            ? this.settingsService.updateSettings(payload.id, {
                  value: payload.value,
                  description: payload.description
              })
            : this.settingsService.createSettings({
                  key: payload.key,
                  value: payload.value,
                  description: payload.description
              });

        request$.subscribe({
            next: () => {
                this.isSaving.set(false);
                this.isModalOpen.set(false);
                this.refreshTable();
            },
            error: (err) => {
                console.error('Error al guardar configuración:', err);
                this.isSaving.set(false);
            }
        });
    }

    // --- ACCIONES ELIMINACIÓN ---

    onDeleteItem(item: Settings): void {
        this.itemToDelete.set(item);
        this.isDeleteModalOpen.set(true);
    }

    onConfirmDelete(): void {
        const item = this.itemToDelete();
        if (!item?.id) return;

        this.isDeleting.set(true);

        this.settingsService.deleteSettings(item.id).subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.isDeleteModalOpen.set(false);
                this.itemToDelete.set(null);
                this.refreshTable();
            },
            error: (err) => {
                console.error('Error al eliminar configuración:', err);
                this.isDeleting.set(false);
            }
        });
    }

    deleteMessage = computed(() => {
        const item = this.itemToDelete();
        return item ? `¿Estás seguro de que deseas eliminar la configuración "${item.key}"?` : '';
    });

    private refreshTable(): void {
        if (this.settingsTable && typeof (this.settingsTable as any).reload === 'function') {
            (this.settingsTable as any).reload();
        }
    }
}