import { Timestamp } from "@angular/fire/firestore";
import { Device } from "../biller/Device";

export interface UserRecord{
    name:string;
    userId:string;
    email:string;
    image:string;
    lastLogin:Timestamp;
    business:UserBusiness[];
}
export interface UserBusiness{
    businessId:string;
    access:Access;
    name:string;
    address:string;
    joiningDate:Timestamp;
}
export interface BusinessRecord{
    businessId:string;
    hotelName:string;
    hotelLogo:string;
    address:string;
    phone:string;
    email:string;
    image:string;
    modes:boolean[],
    fssai:string;
    gst:string;
    billerPrinter:string;
    cgst:number;
    sgst:number;
    users:Member[];
    billerPin:string;
    devices:string[]
}
export interface Access {
    lastUpdated:Timestamp;
    updatedBy:string;
    accessLevel:"manager"|
    "waiter"|
    "accountant"|
    "admin";
}
export interface Member{
    email:string;
    access:string;
    updatedBy:string;
    lastUpdated:Timestamp;
    new?:boolean;
}