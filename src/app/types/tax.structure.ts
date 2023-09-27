import { Timestamp } from '@angular/fire/firestore';

export interface Tax {
  id?: string;
  name: string;
  cost: number;
  amount: number;
  type: 'percentage' | 'amount';
  mode: 'bill' | 'product';
  creationDate: Timestamp;
  updateDate: Timestamp;
}

export interface productTax extends Tax {
  nature: 'inclusive' | 'exclusive';
}
export interface ExtendedTax extends Tax {
  checked: boolean;
}
