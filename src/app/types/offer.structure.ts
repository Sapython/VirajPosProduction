import { Product } from './product.structure';

export interface ComboOffer {
  id: string;
  name: string;
  description: string;
  categories: ComboCategory[];
  image?: string;
}

export interface ComboCategory {
  name: string;
  items: Product[];
  quantity: number;
  price: number;
  discount: number;
}
