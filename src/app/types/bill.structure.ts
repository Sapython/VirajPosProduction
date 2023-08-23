import { Timestamp } from '@angular/fire/firestore';
import { CustomerInfo, UserConstructor } from './user.structure';
import { Billing, Payment } from './payment.structure';
import { KotConstructor } from './kot.structure';
import { TableConstructor } from './table.structure';
import { splittedProduct } from './product.structure';
import { Menu } from './menu.structure';

export interface BillConstructor {
  id: string;
  tokens: string[];
  billNo?: string;
  orderNo: string | null;
  createdDate: Timestamp;
  billSplits: PrintableBill[];
  billReprints: {
    reprintReason: string;
    time: Timestamp;
    user: UserConstructor;
  }[];
  modifiedAllProducts: any[];
  optionalTax: boolean;
  stage: 'active' | 'finalized' | 'settled' | 'cancelled';
  cancelledReason?: {
    reason: string;
    time: Timestamp;
    phone: string;
    user: UserConstructor;
  };
  settlement?: {
    payments: Payment[];
    time: Timestamp;
    user: UserConstructor;
    additionalInfo: any;
  };
  instruction?: string;
  customerInfo: CustomerInfo;
  billingMode: 'cash' | 'card' | 'upi' | 'nonChargeable';
  mode: 'dineIn' | 'takeaway' | 'online';
  user: UserConstructor;
  menu:Menu;
  kots: KotConstructor[];
  table: TableConstructor;
  billing: Billing;
  printableBillData?: PrintableBill;
  nonChargeableDetail?: {
    reason: string;
    time: Timestamp;
    user: UserConstructor;
    phone: string;
    name: string;
  };
  appliedCharges:{
    serviceCharge:number,
    tip:number,
    deliveryCharge:number,
    containerCharge:number,
  };
  currentLoyalty: billLoyalty;
}
export interface billLoyalty {
  loyaltySettingId: string;
  totalLoyaltyCost: number;
  totalLoyaltyPoints: number;
  totalToBeRedeemedPoints: number;
  totalToBeRedeemedCost: number;
  receiveLoyalty: boolean;
  redeemLoyalty: boolean;
  expiryDate?: Timestamp;
}
export interface PrintableBill {
  businessDetails: {
    name: string;
    address: string;
    phone: string;
    fssai: string;
    gstin: string;
    email: string;
  };
  customerDetail: {
    name?: string;
    phone?: string;
    address?: string;
    gstin?: string;
  };
  date: string;
  time: string;
  orderNo: string;
  billNoSuffix?: string;
  billNo: string;
  cashierName: string;
  mode: 'Dine In' | 'Takeaway' | 'Online';
  products: printableBillItem[];
  totalQuantity: number;
  subTotal: number;
  postDiscountSubTotal: number;
  postChargesSubTotal: number;
  discounts: printableDiscount[];
  taxes: printableTax[];
  grandTotal: number;
  note: string;
  notes: string[];
  currentLoyalty: billLoyalty;
  appliedCharges:{
    serviceCharge:number,
    tip:number,
    deliveryCharge:number,
    containerCharge:number,
  };
}

export interface printableBillItem {
  id: string;
  name: string;
  quantity: number;
  untaxedValue: number;
  total: number;
}

export interface printableDiscount {
  name: string;
  rate: number;
  type: 'flat' | 'percentage';
  value: number;
}

export interface printableTax {
  name: string;
  rate: number;
  value: number;
}
