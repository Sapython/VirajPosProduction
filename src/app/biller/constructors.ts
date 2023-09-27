import { Timestamp } from '@angular/fire/firestore';
import { Bill } from './Bill';
import { Kot } from './Kot';
import { Discount } from './settings/settings.component';

export interface BillConstructor {
  id: string;
  tokens: string[];
  billNo?: string;
  orderNo: string|null;
  createdDate: Timestamp;
  stage: 'active' | 'finalized' | 'settled' | 'cancelled';
  cancelledReason?: {
    reason: string;
    time: Timestamp;
    phone: string;
    user: UserConstructor;
  };
  settlement?:{
    customerName: string;
    customerContact: string;
    paymentMethod: string;
    cardEnding?: string;
    upiAddress?: string;
    time: Timestamp;
    user: UserConstructor;
  }
  instruction?: string;
  customerInfo: CustomerInfo;
  billingMode: 'cash' | 'card' | 'upi' | 'nonChargeable';
  mode: 'dineIn' | 'takeaway' | 'online';
  device: DeviceConstructor;
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

export interface UserConstructor {
  id: string;
  name: string;
  access: string;
  image: string;
}

export interface Billing {
  subTotal: number;
  discount: Discount[];
  taxes: Tax[];
  totalTax: number;
  grandTotal: number;
}

export interface KotConstructor {
  id: string;
  createdDate: Timestamp;
  stage: 'active' | 'finalized' | 'cancelled' | 'edit';
  products: Product[];
  editMode: boolean;
  selected: boolean;
  allSelected: boolean;
  someSelected: boolean;
  // selectAll(event:any): void;
  // checkAll(): void;
  // toObject(): any;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'veg' | 'non-veg';
  tags: string[];
  images: string[];
  category:{id:string,name:string};
  quantity: number;
  createdDate: Timestamp;
  variants: Variant[];
  sales?:number;
  selected: boolean;
  transferred?:string;
  instruction?: string;
  visible:boolean;
  updated?:boolean;
  lineDiscount?:Discount;
}

interface Variant {
  name: string;
  price: number;
}

export interface DeviceConstructor {
  id: string;
  lastLogin: Timestamp;
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
  gst?: string;
  deliveryName?: string;
  deliveryPhone?: string;
}

export type Tax = {
  value: number;
  type: 'percentage' | 'flat';
  name: string;
  amount: number;
  id?: string;
};

export type TableConstructor = {
  id: string;
  tableNo: number;
  bill: Bill | null;
  maxOccupancy: string;
  name: string;
  timeSpent:string;
  minutes:number;
  occupiedStart: Timestamp;
  billPrice: number;
  status: 'available' | 'occupied';
  type: 'table' | 'room' | 'token' | 'online';
};


