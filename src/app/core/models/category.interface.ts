export interface Category {
    id?: number;
    name: string;
    slug: string;
    parentCategoryId?: number | null;
    subcategories?: Category[];
}