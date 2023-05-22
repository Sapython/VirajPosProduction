import { Timestamp } from '@angular/fire/firestore';
import { Bill } from './Bill';
import { Kot } from './Kot';
import { CodeBaseDiscount, DirectFlatDiscount, DirectPercentDiscount } from './settings/settings.component';
import { Payment } from '../structures/general.structure';

export interface BillConstructor {
  id: string;
  tokens: string[];
  billNo?: string;
  orderNo: string|null;
  createdDate: Timestamp;
  billReprints:{
    reprintReason:string;
    time:Timestamp;
    user:UserConstructor;
  }[];
  modifiedAllProducts:any[];
  optionalTax:boolean;
  stage: 'active' | 'finalized' | 'settled' | 'cancelled';
  cancelledReason?: {
    reason: string;
    time: Timestamp;
    phone: string;
    user: UserConstructor;
  };
  settlement?:{
    payments:Payment[];
    time: Timestamp;
    user: UserConstructor;
    additionalInfo:any;
  }
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

export interface UserConstructor {
  username: string;
  access: string;
}

export interface Billing {
  subTotal: number;
  discount: (CodeBaseDiscount | DirectPercentDiscount | DirectFlatDiscount)[];
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
  unmade?:boolean;
  cancelReason?:{
    reason:string;
    time:Timestamp;
    user:UserConstructor;
  };
  // selectAll(event:any): void;
  // checkAll(): void;
  // toObject(): any;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  taxedPrice?:number;
  type: 'veg' | 'non-veg';
  tags: {name:string,color:string,contrast:string,important:boolean}[];
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
  lineDiscount?:DirectPercentDiscount | DirectFlatDiscount;
  order?:number;
  taxes:productTax[];
}
export interface productTax extends Tax {
  nature: 'inclusive' | 'exclusive';
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


export interface Tax {
  id?:string;
  name:string;
  cost:number;
  amount:number;
  type:'percentage'|'amount';
  mode:'bill'|'product';
  creationDate:Timestamp;
  updateDate:Timestamp;
}

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
  completed?:boolean;
  status: 'available' | 'occupied';
  type: 'table' | 'room' | 'token' | 'online';
};


