import { Category } from './category.interface';
import { Brand } from './brand.interface';
import { Model } from './model.interface';
import { Section } from './section.interface';

export interface Product {
	id?: number;
	name: string;
	description?: string;
	price: number;
	stock?: number;
	imageUrl?: string;
	specifications?: string;

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
}