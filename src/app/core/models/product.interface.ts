import { Category } from './category.interface';
import { Brand } from './brand.interface';
import { Model } from './model.interface';
import { Section } from './section.interface';

export interface ProductMedia {
	id?: number;
	productId?: number;
	url: string;
	mediaType: 'image' | 'video';
	isPrimary?: boolean;
	isDeleted?: boolean;
	createdBy?: number | null;
	createdAt?: string;
	modifiedBy?: number | null;
	modifiedAt?: string | null;
	deletedBy?: number | null;
	deletedAt?: string | null;
}

export interface Product {
	id?: number;
	slug?: string;
	code?: string;
	barcode?: string;
	name: string;
	description?: string;
	price: number;
	stock?: number;
	imageUrl?: string;
	media?: ProductMedia[];
	specifications?: Record<string, string> | null;

	categoryId?: number | null;
	category?: Category;

	subcategoryId?: number | null;
	subcategory?: Category;

	brandId?: number | null;
	brand?: Brand;

	modelId?: number | null;
	model?: Model;

	sectionId?: number | null;
	section?: Section;

	sectionName?: string;
	categoryName?: string;
	subcategoryName?: string;
	brandName?: string;
	modelName?: string;
}