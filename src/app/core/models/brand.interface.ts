import { Model } from './model.interface';

export interface Brand {
    id?: number;
    name: string;
    models?: Model[];
}