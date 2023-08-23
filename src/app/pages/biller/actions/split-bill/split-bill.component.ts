import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertsAndNotificationsService } from '../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { KotConstructor } from '../../../../types/kot.structure';
import { Bill } from '../../../../core/constructors/bill';
import {
  BillConstructor,
  PrintableBill,
  printableBillItem,
} from '../../../../types/bill.structure';
import { calculateProducts } from '../../../../core/constructors/bill/methods/calculation.bill';
import { Kot } from '../../../../core/constructors/kot/Kot';
import { Billing } from '../../../../types/payment.structure';
import { Tax } from '../../../../types/tax.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import {
  getPrintableBill,
  getPrintableBillConstructor,
} from '../../../../core/constructors/bill/methods/getHelpers.bill';
import { AddDiscountComponent } from '../add-discount/add-discount.component';
import { SettleComponent } from '../settle/settle.component';
import { Timestamp } from '@angular/fire/firestore';
import { BillService } from '../../../../core/services/database/bill/bill.service';
import { PrinterService } from '../../../../core/services/printing/printer/printer.service';
import { AnalyticsService } from '../../../../core/services/database/analytics/analytics.service';
import { ApplicableCombo } from '../../../../core/constructors/comboKot/comboKot';
import { Product } from '../../../../types/product.structure';
import { SetChargesComponent } from '../set-charges/set-charges.component';

@Component({
  selector: 'app-split-bill',
  templateUrl: './split-bill.component.html',
  styleUrls: ['./split-bill.component.scss'],
})
export class SplitBillComponent {
  allKots: extendedKotConstructor[];
  splittedBills: BillConstructor[] = [];
  kotNoColors: { color: string; contrast: string }[] = [
    { color: '#4dc9f6', contrast: '#000' },
    { color: '#f67019', contrast: '#fff' },
    { color: '#f53794', contrast: '#fff' },
    { color: '#537bc4', contrast: '#fff' },
    { color: '#acc236', contrast: '#fff' },
    { color: '#166a8f', contrast: '#fff' },
    { color: '#00a950', contrast: '#fff' },
    { color: '#58595b', contrast: '#fff' },
    { color: '#8549ba', contrast: '#fff' },
  ];
  selectAll(event: any, kot: extendedKotConstructor) {
    //  console.log('event', event);
    kot.items.forEach((product) => {
      product.selected = event.checked;
    });
  }
  checkAll(event: any, kot: any, item: any) {
    //  console.log('event', event);
    item.selected = event.checked;
    if (kot.items.every((product: any) => product.selected)) {
      kot.allSelected = true;
      kot.someSelected = false;
      //  console.log('kot', kot.allSelected);
    } else if (kot.items.some((product: any) => product.selected)) {
      kot.allSelected = false;
      kot.someSelected = true;
      //  console.log('kot', kot.someSelected);
    } else {
      kot.allSelected = false;
      kot.someSelected = false;
      //  console.log('kot', kot.someSelected);
    }
  }

  constructor(
    @Inject(DIALOG_DATA) private bill: {bill:Bill,elevatedUser:string},
    public dialogRef: DialogRef,
    private alertify: AlertsAndNotificationsService,
    public dataProvider: DataProvider,
    private dialog: Dialog,
    private billService: BillService,
    private printingService: PrinterService,
    private analyticsService:AnalyticsService
  ) {
    let kots:any[] = structuredClone(bill.bill.kots.map((kot) => kot.toObject()));
    this.allKots = kots.map((kot) => {
      return {
        ...kot,
        items:kot.products.map((product)=>{
          console.log('product',product.sellByAvailable);
          return {
            ...product,
            maxQuantity:product.quantity,
            newQuantity:product.quantity,
            amount:product.quantity * product.price
          }
        })
      }
    });
    this.allKots.forEach((kot) => {
      kot.items.forEach((product) => {
        product.selected = false;
      });
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  splitBill() {
    let products: any[] = [];
    let kots: extendedKotConstructor[] = [];
    this.allKots.forEach((kot) => {
      let localProducts = [];
      kot.items.forEach((product) => {
        if (product.selected) {
          localProducts.push({ ...product, kot: kot });
        }
      });
      if (localProducts.length > 0) {
        let kotCopy = JSON.parse(JSON.stringify(kot));
        kotCopy.items = localProducts;
        kots.push(kotCopy);
      }
    });
    if (kots.length == 0 || kots[0].items.length == 0) {
      this.alertify.presentToast('Please select atleast one item to split');
      return;
    }
    let discounts = [];
    let billing: Billing = {
      discount: [],
      grandTotal: 0,
      subTotal: 0,
      taxes: [],
      totalTax: 0,
      postDiscountSubTotal:0,
      postChargesSubTotal:0,
    };
    console.log('kots', kots);
    // convert extendedKotConstructor to KotConstructor
    let kotsConstructed:any[] = kots.map((kot)=>{
      return {
        ...kot,
        products:kot.items.map((product)=>{
          return {
            ...product,
            quantity:product.newQuantity
          }
        })
      }
    })
    console.log('constructed kots: ', kots);
    let billConstructor: BillConstructor = {
      billing: billing,
      id: this.bill.bill.id,
      kots: kotsConstructed,
      mode: this.bill.bill.mode,
      table: this.bill.bill.table,
      tokens: this.bill.bill.tokens,
      user: this.bill.bill.user,
      createdDate: this.bill.bill.createdDate,
      stage: 'active',
      menu:this.bill.bill.menu,
      customerInfo: {
        name: this.bill.bill.customerInfo.name || '',
        phone: this.bill.bill.customerInfo.phone || '',
        address: this.bill.bill.customerInfo.address || '',
        deliveryName: this.bill.bill.customerInfo.deliveryName || '',
        deliveryPhone: this.bill.bill.customerInfo.deliveryPhone || '',
        gst: this.bill.bill.customerInfo.gst || '',
      },
      settlementElevatedUser:this.bill.elevatedUser,
      appliedCharges:{
        tip:0,
        serviceCharge:0,
        deliveryCharge:0,
        containerCharge:0,
      },
      orderNo: this.bill.bill.orderNo,
      optionalTax: this.bill.bill.optionalTax,
      instruction: this.bill.bill.instruction || '',
      modifiedAllProducts: this.bill.bill.modifiedAllProducts,
      billSplits: [],
      billReprints: [],
      billingMode: this.bill.bill.billingMode,
      currentLoyalty: {
        loyaltySettingId: '',
        totalLoyaltyCost: 0,
        totalLoyaltyPoints: 0,
        totalToBeRedeemedPoints: 0,
        totalToBeRedeemedCost: 0,
        receiveLoyalty: false,
        redeemLoyalty: false,
      },
    };
    calculateBill(billConstructor, this.dataProvider);
    this.splittedBills.push(billConstructor);
    // remove selected products from original bill
    this.allKots.forEach((kot) => {
      kot.items = kot.items.map((product) => {
        if (product.selected){
          product.maxQuantity = product.maxQuantity - product.newQuantity;
          product.newQuantity = product.maxQuantity;
          return product;
        } else {
          return product;
        }
      });
    });
    this.allKots.forEach((kot) => {
      kot.items = kot.items.filter((product) => !(product.maxQuantity==0));
    });
    // remove kots with no products
    this.allKots = this.allKots.filter((kot) => kot.items.length > 0);
  }

  checkQuantity(item){
    if(item.newQuantity>item.maxQuantity){
      item.newQuantity = item.maxQuantity;
    } else if(item.newQuantity<0){
      item.newQuantity = 0;
    }
    item.amount = this.roundOff(item.newQuantity*item.price);
    if(item.newQuantity==0){
      item.selected = false;
    } else if(item.newQuantity>0){
      item.selected = true;
    } else {
      item.selected = false;
    }
  }

  settleBill(billConstructor: BillConstructor) {
    let dialog = this.dialog.open(SettleComponent, {
      data: billConstructor.billing.grandTotal,
    });
    dialog.closed.subscribe((result: any) => {
      //  console.log('Result', result);
      if (
        result &&
        billConstructor &&
        result.settling &&
        result.paymentMethods
      ) {
        // billConstructor.settle(result.paymentMethods,'internal',result.detail || null);
        billConstructor.settlement = {
          additionalInfo: result.detail || null,
          payments: result.paymentMethods,
          time: Timestamp.now(),
          user: {
            access: this.dataProvider.currentBusinessUser.accessType == 'role' ? this.dataProvider.currentBusinessUser.role : 'custom',
            username: this.dataProvider.currentBusinessUser.username,
          },
          elevatedUser:this.bill.elevatedUser
        };
        billConstructor.stage = 'settled';
        calculateBill(billConstructor, this.dataProvider);
      }
    });
  }

  addDiscount(billConstructor: BillConstructor) {
    const dialog = this.dialog.open(AddDiscountComponent, {
      data: billConstructor,
    });
    dialog.closed.subscribe((result: any) => {
      //  console.log("Result",result);
      if (typeof result == 'object' && this.dataProvider.currentBill) {
        //  console.log(result);
        billConstructor.billing.discount = result;
        calculateBill(billConstructor, this.dataProvider);
      }
    });
  }

  async saveSplittedBill() {
    if (this.splittedBills.length == 0) {
      this.alertify.presentToast('Please split the bill first');
      return;
    }
    if (this.allSettled) {
      this.dataProvider.loading = true;
      let ids = await Promise.all(
        this.splittedBills.map(async (bill, index) => {

          bill.table = bill.table.id || (bill.table as any);
          setTimeout(() => {
            this.printingService.printBill(
              JSON.parse(JSON.stringify(bill.printableBillData)),
            );
          }, index * 1000);
          // console.log("Printing Bill",bill.printableBillData);
          let res = (
            await this.billService.saveSplittedBill(this.bill.bill.id, bill)
          ).id;
          //  console.log("Saved splitted bill");
          return res;
        }),
      );
      this.billService.addActivity(this.bill.bill,{
        type:'billSplit',
        message:'Bill splitted by '+this.dataProvider.currentBusinessUser.username,
        user:this.dataProvider.currentBusinessUser.username,
        data:{
          originalBillId:this.bill.bill.id,
          splittedBillIds:ids
        }
      });
      this.bill.bill.settle(
        this.splittedBills.map((bill) => bill.settlement.payments).flat(),
        'internal',
        {
          splitBill: true,
          bills: ids,
        },
      );
      this.dataProvider.loading = false;
      this.dialogRef.close();
    }
  }

  get allSettled() {
    return (
      this.splittedBills.length &&
      this.splittedBills.every((bill) => bill.stage == 'settled')
    );
  }

  setItemAmount(item:extendedProduct|extendedApplicableCombo){
    // generate quantity based upon price and amount
    if(item.sellBy=='price'){
      item.newQuantity = this.roundOff(item.amount/item.price);
      this.checkQuantity(item);
    }
  }

  roundOff(amount: number) {
    // round off to 2 digits epsilon
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }

  addCharges(bill:BillConstructor|Bill){
    const dialog = this.dialog.open(SetChargesComponent);
    dialog.closed.subscribe((result: any) => {
      bill.appliedCharges = result;
      calculateBill(bill,this.dataProvider);
    })
  }


}

export function calculateBill(
  bill: BillConstructor,
  dataProvider: DataProvider,
) {
  if (bill.billingMode === 'nonChargeable') {
    bill.billing.subTotal = 0;
    bill.billing.grandTotal = 0;
    return;
  }
  let productCalculation = calculateProducts(bill.kots);
  let allProducts = productCalculation.allProducts;
  let finalTaxes: Tax[] = productCalculation.finalTaxes;
  let finalAdditionalTax = productCalculation.finalAdditionalTax;
  bill.billing.subTotal = allProducts.reduce((acc, cur) => {
    return acc + cur.untaxedValue;
  }, 0);
  let applicableDiscount = 0;
  // apply discount to subTotal
  bill.billing.discount.forEach((discount) => {
    discount.totalAppliedDiscount = 0;
    if (discount.mode == 'codeBased') {
      if (discount.type === 'percentage') {
        let discountValue = (bill.billing.subTotal / 100) * discount.value;
        applicableDiscount += discountValue;
        discount.totalAppliedDiscount += Number(discountValue);
      } else {
        applicableDiscount += discount.value;
        discount.totalAppliedDiscount += Number(discount.value);
      }
    } else if (discount.mode == 'directFlat') {
      applicableDiscount += discount.value;
      discount.totalAppliedDiscount += Number(discount.value);
    } else if (discount.mode == 'directPercent') {
      let discountValue = (bill.billing.subTotal / 100) * discount.value;
      applicableDiscount += discountValue;
      discount.totalAppliedDiscount += Number(discountValue);
    }
  });

  bill.billing.taxes = finalTaxes.filter((tax) => tax.amount > 0);
  let totalApplicableTax = bill.billing.taxes.reduce((acc, cur) => {
    return acc + cur.amount;
  }, 0);
  // console.log(
  //   'totalApplicableTax',
  //   bill.billing.taxes,
  //   finalTaxes,
  //   totalApplicableTax,
  //   finalAdditionalTax
  // );
  bill.billing.grandTotal =
    Math.ceil(bill.billing.subTotal - applicableDiscount + totalApplicableTax);
  bill.printableBillData = getPrintableBillConstructor(
    bill,
    allProducts,
    dataProvider,
  );

}
interface extendedKotConstructor extends KotConstructor {
  items:(extendedProduct|extendedApplicableCombo)[];
}

interface extendedProduct extends Product {
  maxQuantity:number;
  newQuantity:number;
  sellByAvailable:boolean;
  sellBy?:'quantity'|'price';
  amount:number;
}

interface extendedApplicableCombo extends ApplicableCombo {
  maxQuantity:number;
  newQuantity:number;
  sellByAvailable:boolean;
  sellBy?:'quantity'|'price';
  amount:number;
}