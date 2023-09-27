import { Timestamp } from '@angular/fire/firestore';
import {
  DirectFlatDiscount,
  DirectPercentDiscount,
} from './discount.structure';
import { Product } from './product.structure';
import { Tax } from './tax.structure';
import { Category } from './category.structure';

export interface Combo {
  id: string;
  name: string;
  offerImage?: string;
  discounted: boolean;
  maximumNoOfPurchases: number;
  updateDate: Timestamp;
  creationDate: Timestamp;
  selectedCategories: ComboCategoryCategorized[];
  visibilitySettings: VisibilitySettings;
  visibilityEnabled:boolean;
  enabled?: boolean;
}

export interface VisibilitySettings {
  mode: 'weekly' | 'monthly';
  repeating: boolean;
  daysSetting: {
    month:
      | 'January'
      | 'February'
      | 'March'
      | 'April'
      | 'May'
      | 'June'
      | 'July'
      | 'August'
      | 'September'
      | 'October'
      | 'November'
      | 'December';
    days: {
      weekName: string;
      week: {
        day:
          | 'Sunday'
          | 'Monday'
          | 'Tuesday'
          | 'Wednesday'
          | 'Thursday'
          | 'Friday'
          | 'Saturday';
        possible: boolean;
        selected: boolean;
      }[];
    }[];
  }[];
}

export interface ComboCategoryCategorized {
  id: string;
  name: string;
  category: Category;
  selectedProducts?: Product[];
  offerType: 'discount' | 'free' | 'fixed' | 'mustBuy' |'loyalty';
  appliedOn: 'item' | 'group';
  discountType: 'flat' | 'percentage';
  amount?: number;
  maximumProducts?: number;
  minimumProducts?: number;
}

export interface ComboTypeCategorized extends ComboType {
  categories: TypeCategory[];
}

export interface TypeConfiguration {
  categories: TypeCategory[];
}

export interface TypeCategory {
  id: string;
  name: string;
  maximumProducts?: number;
  minimumProducts?: number;
  offerType: 'discount' | 'free';
  offerValue?: number;
  products: {
    id: string;
    name: string;
    price: number;
  }[];
  productTree: productTree[];
}

export interface ComboType {
  id?: string;
  name: string;
  image: string;
  description?: string;
  creationDate: any;
  updateDate: any;
  selected?: boolean;
}

export interface productTree {
  categoryName: string;
  categoryId: string;
  selected: boolean;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    selected: boolean;
  }[];
}

export interface TimeGroup {
  id?: string;
  name: string;
  conditions: TimeCondition[];
  selected: boolean;
}

export interface TimeCondition {
  type: 'time' | 'day' | 'date';
  condition: 'is' | 'is not' | 'is before' | 'is after';
  value: any;
}

export interface ApplicableComboConstructor {
  itemType: 'combo';
  id: string;
  combo: Combo;
  selected: boolean;
  productSelection: ComboProductSelection[];
  quantity: number;
  cancelled: boolean;
  price: number;
  name: string;
  instruction: string;
  transferred?: string;
  incomplete: boolean;
  canBeDiscounted: boolean;
  canBeApplied: boolean;
  untaxedValue: number;
  lineDiscount?: DirectPercentDiscount | DirectFlatDiscount;
  lineDiscounted: boolean;
  totalAppliedTax: number;
  totalAppliedPercentage: number;
  finalTaxes: Tax[];
}
export interface ComboProductSelection {
  id: string;
  name: string;
  products: Product[];
  config: any;
}
