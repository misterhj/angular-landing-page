export interface Category {
  id: number;
  name: string;
  slug: string;
  sectionId?: number;
  subcategoriesCount?: number;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}