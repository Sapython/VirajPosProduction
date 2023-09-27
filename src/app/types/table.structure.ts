import { Timestamp } from '@angular/fire/firestore';
import { Bill } from '../core/constructors/bill';

export type TableConstructor = {
  id: string;
  tableNo: number|string;
  bill: Bill | null;
  maxOccupancy: string;
  name: string;
  timeSpent: string;
  minutes: number;
  group: string;
  order: number;
  occupiedStart: Timestamp;
  billPrice: number;
  completed?: boolean;
  status: 'available' | 'occupied';
  type: 'table' | 'room' | 'token' | 'online';
};
