import { Combo } from './combo.structure';
import { Product } from './product.structure';

export interface ComboCategory {
  id: string;
  name: string;
  combos: Combo[];
  averagePrice?: number;
  enabled: boolean;
  updated?: boolean;
  printer?: string;
  loading?: boolean;
  order?: number;
  productOrders?: string[];
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
  averagePrice?: number;
  enabled: boolean;
  updated?: boolean;
  loading?: boolean;
  order?: number;
  productOrders?: string[];
}
export interface RootCategory {
  id: string;
  name: string;
  averagePrice?: number;
  enabled: boolean;
}
export interface ViewCategory extends RootCategory {
  products: string[];
  settings?: any;
}
