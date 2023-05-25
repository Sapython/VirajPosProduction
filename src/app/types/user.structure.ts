import { Timestamp } from '@angular/fire/firestore';

export interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
  gst?: string;
  deliveryName?: string;
  deliveryPhone?: string;
}

export interface UserConstructor {
  username: string;
  access: string;
}

export interface UserRecord {
  username: string;
  lastLogin: Timestamp;
  business: UserBusiness[];
}
export interface UserBusiness {
  businessId: string;
  access: Access;
  name: string;
  address: string;
  joiningDate: Timestamp;
}
export interface BusinessRecord {
  businessId: string;
  hotelName: string;
  hotelLogo: string;
  address: string;
  phone: string;
  username: string;
  email: string;
  image: string;
  modes: boolean[];
  fssai: string;
  gst: string;
  billerPrinter: string;
  cgst: number;
  sgst: number;
  users: Member[];
  billerPin: string;
  devices: string[];
}
export interface Access {
  lastUpdated: Timestamp;
  updatedBy: string;
  accessLevel: 'manager' | 'waiter' | 'accountant' | 'admin';
}
export interface Member {
  access: string;
  updatedBy: string;
  lastUpdated: Timestamp;
  new?: boolean;
  username: string;
}

export interface AdditonalClaims {
  email?: string;
  providerId: string;
  image?: string;
  phone?: string;
  business: {
    access: { accessLevel: string; lastUpdated: Timestamp; updatedBy: string };
    address: string;
    businessId: string;
    joiningDate: Timestamp;
    name: string;
  }[];
}
