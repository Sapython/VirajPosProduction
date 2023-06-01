import { Timestamp } from '@angular/fire/firestore';
import { UserConstructor } from './user.structure';
import { Product } from './product.structure';
import { Category } from './category.structure';

export interface KotConstructor {
  id?: string;
  createdDate: Timestamp;
  stage: 'active' | 'finalized' | 'cancelled' | 'edit';
  products: Product[];
  editMode: boolean;
  selected: boolean;
  allSelected: boolean;
  someSelected: boolean;
  unmade?: boolean;
  cancelReason?: {
    reason: string;
    time: Timestamp;
    user: UserConstructor;
  };
  mode?:'firstChargeable'
  | 'cancelledKot'
  | 'editedKot'
  | 'runningNonChargeable'
  | 'runningChargeable'
  | 'firstNonChargeable'
  | 'reprintKot'
  | 'online';
}

export interface kotReport extends KotConstructor {
  billNo: string;
  grandTotal: number;
  tokenNo: string;
}

export interface PrintableKot {
  mode:'firstChargeable'|'cancelledKot'|'editedKot'|'runningNonChargeable'|'runningChargeable'|'firstNonChargeable'|'reprintKot'|'online';
  billingMode:'dineIn'|'takeaway'|'online';
  date:string;
  time:string;
  token:string;
  orderNo:string;
  table:string;
  products:printableKotItem[];
}

export interface printableKotItem {
  name:string;
  instruction:string;
  quantity:number;
  category:any;
  edited?:boolean;
}