import { Product } from "../biller/constructors";

export interface Payment {
    paymentMethod:string;
    amount:number;
    paymentMethods:string[];
}
export interface Category {
    id:string;
    name:string;
    products:Product[];
    averagePrice?:number;
    enabled:boolean;
    updated?:boolean;
    printer?:string;
    loading?:boolean;
    order?:number;
    productOrders?:string[];
}
export interface RootCategory {
    id:string;
    name:string;
    averagePrice?:number;
    enabled:boolean;
}
export interface ViewCategory extends RootCategory {
    products:string[];
    settings?:any;
}

export interface Ingredient {
    id?: string;
    name: string;
    checked: boolean;
    touched: boolean;
    errorThreshold: number;
    warningThreshold: number;
    images: string[];
    used?: number;
    category: string;
    unit: string;
    quantity: number;
    openingBalance: number;
    closingBalance: number;
    stockUsage: number;
    ratePerUnit: number;
    newQuantity: number;
    newRatePerUnit: number;
    finalPrice?: number;
}
// export interface Menu {
//     id?:string;
//     name:string;
//     description:string;
//     templates:string[];
//     categories:Category[];
//     createdAt?:Date;
//     updatedAt?:Date;
// }
export interface MenuData {
    id?:string;
    name:string;
    description:string;
    templates:string[];
    createdAt?:Date;
    updatedAt?:Date;
}

// export interface TableConstructor {
//     id?:string;
//     name:string;
//     createdAt:Date;
//     updatedAt:Date;
//     seatingSpace:number;
//     associatedBill?:string;
//     status:'available'|'occupied'|'reserved'|'outOfOrder';
// }
