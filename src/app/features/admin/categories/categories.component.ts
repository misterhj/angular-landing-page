import {
    Component,
    OnInit,
    signal,
    computed,
    ViewChild,
    TemplateRef,
    AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDef } from '@tanstack/angular-table';
import { GenericTableComponent } from '@shared/components/generic-table/generic-table.component';
import { Category, Subcategory } from '@core/models/category.interface';

import { CategoryModalComponent, CategoryModalPayload } from './category-modal.component';
// 👈 Importamos el modal de confirmación
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [
        CommonModule, 
        GenericTableComponent, 
        CategoryModalComponent,
        ConfirmModalComponent // 👈 Agregado a imports
    ],
    templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit, AfterViewInit {

    @ViewChild('catTable') catTable!: GenericTableComponent;
    @ViewChild('subTable') subTable!: GenericTableComponent;
    @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

    selectedCategory = signal<Category | null>(null);

    // Estado Form Modal
    isModalOpen = signal<boolean>(false);
    modalTitle = signal<string>('');
    editingItem = signal<Category | Subcategory | null>(null);
    parentCategoryIdForModal = signal<number | null>(null);

    // 👈 Estado Delete Confirm Modal
    isDeleteModalOpen = signal<boolean>(false);
    isDeleting = signal<boolean>(false);
    itemToDelete = signal<Category | Subcategory | null>(null);

    subFilters = computed<Record<string, string | undefined>>(() => {
        const cat = this.selectedCategory();
        if (!cat) return {};
        return { categoryid: cat.id.toString() };
    });

    catColumns: ColumnDef<Category>[] = [
        { id: 'actions', header: '' },
        { accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'name', header: 'CATEGORÍA PRINCIPAL' },
        { accessorKey: 'slug', header: 'SLUG' }
    ];

    subColumns: ColumnDef<Subcategory>[] = [
        { id: 'actions', header: '' },
        { accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
        { accessorKey: 'name', header: 'SUBCATEGORÍA' },
        { accessorKey: 'slug', header: 'SLUG' }
    ];

    catTemplates = signal<Record<string, TemplateRef<any>>>({});
    subTemplates = signal<Record<string, TemplateRef<any>>>({});

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.catTemplates.set({ actions: this.actionsTemplate });
        this.subTemplates.set({ actions: this.actionsTemplate });
    }

    onSelectCategory(category: Category): void {
        this.selectedCategory.set(category);
    }

    // --- ACCIONES FORM MODAL ---

    onAddCategory(): void {
        this.modalTitle.set('Nueva Categoría Principal');
        this.editingItem.set(null);
        this.parentCategoryIdForModal.set(null);
        this.isModalOpen.set(true);
    }

    onAddSubcategory(): void {
        const parentCat = this.selectedCategory();
        if (!parentCat) return;

        this.modalTitle.set(`Nueva Subcategoría en ${parentCat.name}`);
        this.editingItem.set(null);
        this.parentCategoryIdForModal.set(parentCat.id);
        this.isModalOpen.set(true);
    }

    onEditItem(item: Category | Subcategory): void {
        this.editingItem.set(item);
        this.parentCategoryIdForModal.set(null);

        const isSub = 'categoryId' in item;
        this.modalTitle.set(isSub ? 'Editar Subcategoría' : 'Editar Categoría Principal');
        this.isModalOpen.set(true);
    }

    onSaveItem(payload: CategoryModalPayload): void {
        console.log('Guardar payload:', payload);
        this.isModalOpen.set(false);
    }

    // --- ACCIONES ELIMINACIÓN ---

    onDeleteItem(item: Category | Subcategory): void {
        this.itemToDelete.set(item);
        this.isDeleteModalOpen.set(true);
    }

    onConfirmDelete(): void {
        const item = this.itemToDelete();
        if (!item) return;

        this.isDeleting.set(true);

        // Simulamos petición de borrado
        setTimeout(() => {
            console.log('Registro eliminado con éxito:', item);
            this.isDeleting.set(false);
            this.isDeleteModalOpen.set(false);
            this.itemToDelete.set(null);

            // Si eliminamos la categoría principal seleccionada actualmente, reseteamos el filtro de subcategorías
            if (this.selectedCategory()?.id === item.id && !('categoryId' in item)) {
                this.selectedCategory.set(null);
            }
        }, 800);
    }

    deleteMessage = computed(() => {
        const item = this.itemToDelete();
        if (!item) return '';
        const isSub = 'categoryId' in item;
        return isSub 
            ? `¿Estás seguro de que deseas eliminar la subcategoría "${item.name}"?` 
            : `¿Estás seguro de que deseas eliminar "${item.name}"? Se pueden ver afectadas sus subcategorías asociadas.`;
    });
}