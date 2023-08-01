import { Timestamp } from '@angular/fire/firestore';
import {
  CodeBaseDiscount,
  DirectFlatDiscount,
  DirectPercentDiscount,
} from './discount.structure';
import { Tax } from './tax.structure';

export interface Payment {
  paymentMethod: string;
  amount: number;
  paymentMethods: string[];
}
export interface Billing {
  subTotal: number;
  postDiscountSubTotal: number;
  discount: (CodeBaseDiscount | DirectPercentDiscount | DirectFlatDiscount)[];
  taxes: Tax[];
  totalTax: number;
  grandTotal: number;
}

export interface PaymentMethod {
  id?: string;
  name: string;
  detail: boolean;
  addDate: Timestamp;
  updateDate: Timestamp;
  custom?: boolean;
}
