import { Brand } from './brand.interface';

export interface Model {
    id?: number;
    name: string;
    brandId: number;
    brand?: Brand;
}