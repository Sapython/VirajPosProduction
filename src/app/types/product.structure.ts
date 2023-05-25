import { Timestamp } from '@angular/fire/firestore';
import {
  DirectFlatDiscount,
  DirectPercentDiscount,
} from './discount.structure';
import { productTax } from './tax.structure';
import { KotConstructor } from './kot.structure';

export interface Product {
  id?: string;
  name: string;
  price: number;
  taxedPrice?: number;
  type: 'veg' | 'non-veg';
  tags: { name: string; color: string; contrast: string; important: boolean }[];
  images: string[];
  category: { id: string; name: string };
  quantity: number;
  createdDate: Timestamp;
  variants: Variant[];
  sales?: number;
  selected: boolean;
  transferred?: string;
  instruction?: string;
  visible: boolean;
  updated?: boolean;
  lineDiscount?: DirectPercentDiscount | DirectFlatDiscount;
  order?: number;
  taxes: productTax[];
}

interface Variant {
  name: string;
  price: number;
}

export interface splittedProduct extends Product {
  kot: KotConstructor;
}
export interface Ingredient {
  id?: string;
  name: string;
  checked: boolean;
  touched: boolean;
  errorThreshold: number;
  warningThreshold: number;
  images: string[];
  used?: number;
  category: string;
  unit: string;
  quantity: number;
  openingBalance: number;
  closingBalance: number;
  stockUsage: number;
  ratePerUnit: number;
  newQuantity: number;
  newRatePerUnit: number;
  finalPrice?: number;
}

export interface productReport extends Product {
  bills: string;
  kots: string;
  quantity: number;
  amount: number;
}
