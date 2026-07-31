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
import { Category, Subcategory } from '@core/models/category.interface';

import { CategoryModalComponent, CategoryModalPayload } from './category-modal.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { CategoryService } from '@core/services/category.service';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [
        CommonModule,
        GenericTableComponent,
        CategoryModalComponent,
        ConfirmModalComponent
    ],
    templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit, AfterViewInit {
    private categoryService = inject(CategoryService);

    @ViewChild('catTable') catTable!: GenericTableComponent;
    @ViewChild('subTable') subTable!: GenericTableComponent;
    @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

    selectedCategory = signal<Category | null>(null);

    // Estado Form Modal
    isModalOpen = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    modalTitle = signal<string>('');
    editingItem = signal<Category | Subcategory | null>(null);
    parentCategoryIdForModal = signal<number | null>(null);

    // Estado Delete Confirm Modal
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

        // 👈 Detectamos si es subcategoría leyendo 'categoryId' o 'parentCategoryId'
        const parentId = 'categoryId' in item
            ? (item as Subcategory).categoryId
            : (item as any).parentCategoryId ?? null;

        this.parentCategoryIdForModal.set(parentId);
        this.modalTitle.set(parentId ? 'Editar Subcategoría' : 'Editar Categoría Principal');
        this.isModalOpen.set(true);
    }

    onSaveItem(payload: CategoryModalPayload): void {
        this.isSaving.set(true);

        const request$ = payload.id
            ? this.categoryService.updateCategory(payload.id, payload)
            : this.categoryService.createCategory(payload);

        request$.subscribe({
            next: () => {
                this.isSaving.set(false);
                this.isModalOpen.set(false);
                this.refreshTables();
            },
            error: (err) => {
                console.error('Error al guardar categoría:', err);
                this.isSaving.set(false);
            }
        });
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

        this.categoryService.deleteCategory(item.id).subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.isDeleteModalOpen.set(false);

                if (this.selectedCategory()?.id === item.id && !('categoryId' in item)) {
                    this.selectedCategory.set(null);
                }

                this.itemToDelete.set(null);
                this.refreshTables();
            },
            error: (err) => {
                console.error('Error al eliminar categoría:', err);
                this.isDeleting.set(false);
            }
        });
    }

    deleteMessage = computed(() => {
        const item = this.itemToDelete();
        if (!item) return '';
        const isSub = 'categoryId' in item || !!(item as any).parentCategoryId;
        return isSub
            ? `¿Estás seguro de que deseas eliminar la subcategoría "${item.name}"?`
            : `¿Estás seguro de que deseas eliminar "${item.name}"? Se pueden ver afectadas sus subcategorías asociadas.`;
    });

    private refreshTables(): void {
        if (this.catTable && typeof (this.catTable as any).reload === 'function') {
            (this.catTable as any).reload();
        }
        if (this.subTable && typeof (this.subTable as any).reload === 'function') {
            (this.subTable as any).reload();
        }
    }
}