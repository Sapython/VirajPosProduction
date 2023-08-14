import { Timestamp } from '@angular/fire/firestore';

export interface CustomerInfo {
  id?: string;
  name?: string;
  phone?: string;
  address?: string;
  gst?: string;
  deliveryName?: string;
  deliveryPhone?: string;
  loyaltyPoints?: number;
  averageBillValue?: number;
  totalSales?:number;
  totalBills?: number;
  lastBillDate?: Timestamp;
  lastBillAmount?: number;
  lastBillId?: string;
  updated?:Timestamp;
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
  city:string;
  state:string;
  joiningDate: Timestamp;
}
export interface BusinessRecord {
  businessId: string;
  hotelName: string;
  hotelLogo: string;
  address: string;
  city:string;
  state:string;
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
  devices: string[];
}
export type Access = {
  lastUpdated: Timestamp;
  updatedBy: string;
} & (RoleProps | CustomProps);
export type Member = {
  updatedBy: string;
  lastUpdated: Timestamp;
  new?: boolean;
  username: string;
} & (RoleProps | CustomProps);

type RoleProps = {
  accessType: 'role';
  role: 'manager' | 'waiter' | 'accountant' | 'admin';
};
type CustomProps = {
  accessType: 'custom';
  propertiesAllowed: string[];
};
// } & {

// } or {
//   accessType:'role' | 'custom';
//   propertyAllowed: string;
// }

export interface AdditonalClaims {
  email?: string;
  providerId: string;
  image?: string;
  phone?: string;
  business: {
    access:
      | {
          accessType: 'role';
          role: string;
          lastUpdated: Timestamp;
          updatedBy: string;
        }
      | {
          accessType: 'custom';
          propertiesAllowed: string[];
          lastUpdated: Timestamp;
          updatedBy: string;
        };
    address: string;
    businessId: string;
    joiningDate: Timestamp;
    name: string;
  }[];
}

export interface Account {
  name: string;
  phoneNumber: string;
  email: string;
  role: 'admin' | 'accountant' | 'manager' | 'waiter';
  creationDate: Timestamp;
}

export type userState =
  | {
      status: false;
      stage: number;
      code: string;
      message: string;
    }
  | {
      status: true;
      stage: number;
      code: string;
      message: string;
      user: UserRecord;
    };
