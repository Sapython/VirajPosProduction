import { Timestamp } from '@angular/fire/firestore';

export interface CodeBaseDiscount {
  mode: 'codeBased';
  type: 'percentage' | 'flat';
  id: string;
  name: string;
  value: number;
  totalAppliedDiscount: number;
  creationDate: Timestamp;
  minimumAmount?: number;
  minimumProducts?: number;
  maximumDiscount?: number;
  menus?: string[];
  accessLevels: string[];
  reason: string;
}
export interface DirectPercentDiscount {
  mode: 'directPercent';
  value: number;
  totalAppliedDiscount: number;
  creationDate: Timestamp;
  reason: string;
}

export interface DirectFlatDiscount {
  mode: 'directFlat';
  value: number;
  totalAppliedDiscount: number;
  creationDate: Timestamp;
  reason: string;
}
