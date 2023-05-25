import { Timestamp } from '@angular/fire/firestore';
import { CustomerInfo, UserConstructor } from './user.structure';
import { Billing, Payment } from './payment.structure';
import { KotConstructor } from './kot.structure';
import { TableConstructor } from './table.structure';
import { splittedProduct } from './product.structure';

export interface BillConstructor {
  id: string;
  tokens: string[];
  billNo?: string;
  orderNo: string | null;
  createdDate: Timestamp;
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
  kots: KotConstructor[];
  table: TableConstructor;
  billing: Billing;
  nonChargeableDetail?: {
    reason: string;
    time: Timestamp;
    user: UserConstructor;
    phone: string;
    name: string;
  };
}

export interface splittedBill {
  products: splittedProduct[];
  grandTotal: number;
}
