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
import { User } from '@core/models/user.interface';

import { UserModalComponent, UserModalPayload } from './user-modal.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { UserService } from '@core/services/user.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule,
        GenericTableComponent,
        UserModalComponent,
        ConfirmModalComponent
    ],
    templateUrl: './users.component.html'
})
export class UsersComponent implements AfterViewInit {
    private userService = inject(UserService);

    @ViewChild('userTable') userTable!: GenericTableComponent;
    @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

    // Estado Form Modal
    isModalOpen = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    modalTitle = signal<string>('');
    editingItem = signal<User | null>(null);

    // Estado Delete Confirm Modal
    isDeleteModalOpen = signal<boolean>(false);
    isDeleting = signal<boolean>(false);
    itemToDelete = signal<User | null>(null);

    userColumns: ColumnDef<User>[] = [
        { id: 'actions', header: '' },
        { accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'firstName', header: 'Nombre' },
        { accessorKey: 'lastName', header: 'Apellido' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'username', header: 'Usuario' },
        { accessorKey: 'identityDocument', header: 'Documento' },
        { accessorKey: 'phoneNumber', header: 'Teléfono' },
        { accessorKey: 'isActive', header: 'Activo', cell: info => info.getValue() ? 'Sí' : 'No' }
    ];

    userTemplates = signal<Record<string, TemplateRef<any>>>({});

    ngAfterViewInit(): void {
        this.userTemplates.set({ actions: this.actionsTemplate });
    }

    // --- ACCIONES FORM MODAL ---

    onEditItem(item: User): void {
        this.editingItem.set(item);
        this.modalTitle.set('Editar Usuario');
        this.isModalOpen.set(true);
    }

    onSaveItem(payload: UserModalPayload): void {
        if (!payload.id) return;
        this.isSaving.set(true);

        this.userService.updateUser(payload.id, payload).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.isModalOpen.set(false);
                this.refreshTable();
            },
            error: (err) => {
                console.error('Error al guardar usuario:', err);
                this.isSaving.set(false);
            }
        });
    }

    // --- ACCIONES ELIMINACIÓN ---

    onDeleteItem(item: User): void {
        this.itemToDelete.set(item);
        this.isDeleteModalOpen.set(true);
    }

    onConfirmDelete(): void {
        const item = this.itemToDelete();
        if (!item) return;

        this.isDeleting.set(true);

        this.userService.deleteUser(item.id).subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.isDeleteModalOpen.set(false);
                this.itemToDelete.set(null);
                this.refreshTable();
            },
            error: (err) => {
                console.error('Error al eliminar usuario:', err);
                this.isDeleting.set(false);
            }
        });
    }

    deleteMessage = computed(() => {
        const item = this.itemToDelete();
        if (!item) return '';
        return `¿Estás seguro de que deseas eliminar al usuario "${item.username}"?`;
    });

    private refreshTable(): void {
        if (this.userTable && typeof (this.userTable as any).reload === 'function') {
            (this.userTable as any).reload();
        }
    }
}