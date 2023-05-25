import { Timestamp } from '@angular/fire/firestore';
import { UserConstructor } from './user.structure';
import { Product } from './product.structure';

export interface KotConstructor {
  id: string;
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
}

export interface kotReport extends KotConstructor {
  billNo: string;
  grandTotal: number;
  tokenNo: string;
}
