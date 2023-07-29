import { Timestamp } from "@angular/fire/firestore";

export interface Menu {
    id?: string;
    name: string;
    description: string;
    menuVersion:number;
    lastUpdated:Timestamp;
    selectedLoyaltyId:string|null;
}

export interface MenuData {
    id?:string;
    name:string;
    description:string;
    templates:string[];
    createdAt?:Date;
    updatedAt?:Date;
}