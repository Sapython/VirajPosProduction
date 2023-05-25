import { CodeBaseDiscount, DirectFlatDiscount, DirectPercentDiscount } from "./discount.structure";
import { Tax } from "./tax.structure";

export interface Payment {
    paymentMethod:string;
    amount:number;
    paymentMethods:string[];
}
export interface Billing {
    subTotal: number;
    discount: (CodeBaseDiscount | DirectPercentDiscount | DirectFlatDiscount)[];
    taxes: Tax[];
    totalTax: number;
    grandTotal: number;
  }
  