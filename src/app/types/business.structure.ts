import { Member } from './user.structure';

export interface OptionalBusinessRecord {
  businessId: string;
  hotelName?: string;
  hotelLogo?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
  modes?: boolean[];
  fssai?: string;
  gst?: string;
  billerPrinter?: string;
  cgst?: number;
  sgst?: number;
  users?: Member[];
  billerPin?: string;
  devices?: string[];
}
