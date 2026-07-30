import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService } from '@core/services/brand.service';
import { ModelService } from '@core/services/model.service';
import { Brand } from '@core/models/brand.interface';
import { Model } from '@core/models/model.interface';

@Component({
    selector: 'app-brands',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './brands.component.html'
})
export class BrandsComponent implements OnInit {
    private brandService = inject(BrandService);
    private modelService = inject(ModelService);

    brands = signal<Brand[]>([]);
    models = signal<Model[]>([]);
    selectedBrand = signal<Brand | null>(null);

    newBrandName = '';
    newModelName = '';

    ngOnInit(): void {
        this.loadBrands();
    }

    loadBrands(): void {
        this.brandService.getBrands().subscribe(data => {
            this.brands.set(data);
        });
    }

    selectBrand(brand: Brand): void {
        this.selectedBrand.set(brand);
        if (brand.id) {
            this.modelService.getModels(brand.id).subscribe(data => {
                this.models.set(data);
            });
        }
    }

    createBrand(): void {
        if (!this.newBrandName.trim()) return;
        this.brandService.createBrand({ name: this.newBrandName }).subscribe(brand => {
            this.newBrandName = '';
            this.loadBrands();
        });
    }

    deleteBrand(id: number): void {
        if (confirm('¿Eliminar esta marca y todos sus modelos?')) {
            this.brandService.deleteBrand(id).subscribe(() => {
                if (this.selectedBrand()?.id === id) {
                    this.selectedBrand.set(null);
                    this.models.set([]);
                }
                this.loadBrands();
            });
        }
    }

    createModel(): void {
        const currentBrand = this.selectedBrand();
        if (!this.newModelName.trim() || !currentBrand?.id) return;

        this.modelService.createModel({
            name: this.newModelName,
            brandId: currentBrand.id
        }).subscribe(() => {
            this.newModelName = '';
            this.selectBrand(currentBrand);
        });
    }

    deleteModel(id: number): void {
        if (confirm('¿Eliminar este modelo?')) {
            this.modelService.deleteModel(id).subscribe(() => {
                const currentBrand = this.selectedBrand();
                if (currentBrand) this.selectBrand(currentBrand);
            });
        }
    }
}