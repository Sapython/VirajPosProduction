import { Timestamp } from '@angular/fire/firestore';

export interface LoyaltySetting {
  name: string;
  id: string;
  baseRate: number;
  expiryDays: number;
  conversionRate: number;
  categoryWiseRates: CategoryLoyaltyRate[];
  addedBy: string;
  creationDate: Timestamp;
}
export interface CategoryLoyaltyRate {
  categoryName: string;
  categoryId: string;
  categoryType: 'view' | 'main';
  products: {
    productName: string;
    id: string;
    price: number;
    loyaltyRate: number;
    loyaltyCost: number;
  }[];
}
