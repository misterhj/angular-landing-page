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
import { Observable } from 'rxjs'; // 👈 Importar Observable
import { ColumnDef } from '@tanstack/angular-table';
import { GenericTableComponent } from '@shared/components/generic-table/generic-table.component';
import { Brand } from '@core/models/brand.interface';
import { Model } from '@core/models/model.interface';

import { BrandModalComponent, BrandModalPayload } from './brand-modal.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { BrandService } from '@core/services/brand.service';
import { ModelService } from '@core/services/model.service';

@Component({
    selector: 'app-brands',
    standalone: true,
    imports: [
        CommonModule,
        GenericTableComponent,
        BrandModalComponent,
        ConfirmModalComponent
    ],
    templateUrl: './brands.component.html'
})
export class BrandsComponent implements OnInit, AfterViewInit {
    private brandService = inject(BrandService);
    private modelService = inject(ModelService);

    @ViewChild('brandTable') brandTable!: GenericTableComponent;
    @ViewChild('modelTable') modelTable!: GenericTableComponent;
    @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

    selectedBrand = signal<Brand | null>(null);

    // Estado Form Modal Unificado
    isModalOpen = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    modalTitle = signal<string>('');
    editingItem = signal<Brand | Model | null>(null);
    brandIdForModal = signal<number | null>(null);

    // Estado Delete Confirm Modal
    isDeleteModalOpen = signal<boolean>(false);
    isDeleting = signal<boolean>(false);
    itemToDelete = signal<{ type: 'brand' | 'model'; item: Brand | Model } | null>(null);

    modelFilters = computed<Record<string, string | undefined>>(() => {
        const brand = this.selectedBrand();
        if (!brand) return {};
        return { brandid: brand.id?.toString() };
    });

    brandColumns: ColumnDef<Brand>[] = [
        { id: 'actions', header: '' },
        { accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'name', header: 'MARCA' }
    ];

    modelColumns: ColumnDef<Model>[] = [
        { id: 'actions', header: '' },
        { accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'name', header: 'MODELO' }
    ];

    brandTemplates = signal<Record<string, TemplateRef<any>>>({});
    modelTemplates = signal<Record<string, TemplateRef<any>>>({});

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.brandTemplates.set({ actions: this.actionsTemplate });
        this.modelTemplates.set({ actions: this.actionsTemplate });
    }

    onSelectBrand(brand: Brand): void {
        this.selectedBrand.set(brand);
    }

    // --- ACCIONES FORM MODAL ---

    onAddBrand(): void {
        this.modalTitle.set('Nueva Marca');
        this.editingItem.set(null);
        this.brandIdForModal.set(null);
        this.isModalOpen.set(true);
    }

    onAddModel(): void {
        const brand = this.selectedBrand();
        if (!brand) return;

        this.modalTitle.set(`Nuevo Modelo en ${brand.name}`);
        this.editingItem.set(null);
        this.brandIdForModal.set(brand.id!);
        this.isModalOpen.set(true);
    }

    onEditItem(item: Brand | Model): void {
        this.editingItem.set(item);

        const isModel = 'brandId' in item;
        const brandId = isModel ? (item as Model).brandId : null;

        this.brandIdForModal.set(brandId);
        this.modalTitle.set(isModel ? 'Editar Modelo' : 'Editar Marca');
        this.isModalOpen.set(true);
    }

    onSaveItem(payload: BrandModalPayload): void {
        this.isSaving.set(true);

        const isModel = !!payload.brandId;

        const request$: Observable<unknown> = isModel
            ? (payload.id
                ? this.modelService.updateModel(payload.id, { name: payload.name, brandId: payload.brandId! })
                : this.modelService.createModel({ name: payload.name, brandId: payload.brandId! }))
            : (payload.id
                ? this.brandService.updateBrand(payload.id, { name: payload.name })
                : this.brandService.createBrand({ name: payload.name }));

        request$.subscribe({
            next: () => {
                this.isSaving.set(false);
                this.isModalOpen.set(false);
                this.refreshTables();
            },
            error: (err) => {
                console.error('Error al guardar:', err);
                this.isSaving.set(false);
            }
        });
    }

    // --- ACCIONES ELIMINACIÓN ---

    onDeleteItem(item: Brand | Model): void {
        const type = 'brandId' in item ? 'model' : 'brand';
        this.itemToDelete.set({ type, item });
        this.isDeleteModalOpen.set(true);
    }

    onConfirmDelete(): void {
        const target = this.itemToDelete();
        if (!target) return;

        this.isDeleting.set(true);

        const request$ = target.type === 'brand'
            ? this.brandService.deleteBrand(target.item.id!)
            : this.modelService.deleteModel(target.item.id!);

        request$.subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.isDeleteModalOpen.set(false);

                if (target.type === 'brand' && this.selectedBrand()?.id === target.item.id) {
                    this.selectedBrand.set(null);
                }

                this.itemToDelete.set(null);
                this.refreshTables();
            },
            error: (err) => {
                console.error('Error al eliminar:', err);
                this.isDeleting.set(false);
            }
        });
    }

    deleteMessage = computed(() => {
        const target = this.itemToDelete();
        if (!target) return '';
        return target.type === 'brand'
            ? `¿Estás seguro de que deseas eliminar la marca "${target.item.name}"? Se eliminarán todos sus modelos asociados.`
            : `¿Estás seguro de que deseas eliminar el modelo "${target.item.name}"?`;
    });

    private refreshTables(): void {
        if (this.brandTable && typeof (this.brandTable as any).reload === 'function') {
            (this.brandTable as any).reload();
        }
        if (this.modelTable && typeof (this.modelTable as any).reload === 'function') {
            (this.modelTable as any).reload();
        }
    }
}