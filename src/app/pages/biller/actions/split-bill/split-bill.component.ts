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
import { getPrintableBill, getPrintableBillConstructor } from '../../../../core/constructors/bill/methods/getHelpers.bill';
import { AddDiscountComponent } from '../add-discount/add-discount.component';
import { SettleComponent } from '../settle/settle.component';
import { Timestamp } from '@angular/fire/firestore';
import { BillService } from '../../../../core/services/database/bill/bill.service';
import { PrinterService } from '../../../../core/services/printing/printer/printer.service';

@Component({
  selector: 'app-split-bill',
  templateUrl: './split-bill.component.html',
  styleUrls: ['./split-bill.component.scss'],
})
export class SplitBillComponent {
  allKots: KotConstructor[];
  splittedBills: BillConstructor[] = [];
  kotNoColors:{color:string,contrast:string}[] =[
    {color:'#4dc9f6',contrast:'#000'},
    {color:'#f67019',contrast: '#fff'},
    {color:'#f53794',contrast: '#fff'},
    {color:'#537bc4',contrast: '#fff'},
    {color:'#acc236',contrast: '#fff'},
    {color:'#166a8f',contrast: '#fff'},
    {color:'#00a950',contrast: '#fff'},
    {color:'#58595b',contrast: '#fff'},
    {color:'#8549ba',contrast: '#fff'},
  ];
  selectAll(event: any, kot: KotConstructor) {
  //  console.log('event', event);
    kot.products.forEach((product) => {
      product.selected = event.checked;
    });
  }
  checkAll(event: any, kot: any, item: any) {
  //  console.log('event', event);
    item.selected = event.checked;
    if (kot.products.every((product: any) => product.selected)) {
      kot.allSelected = true;
      kot.someSelected = false;
    //  console.log('kot', kot.allSelected);
    } else if (kot.products.some((product: any) => product.selected)) {
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
    @Inject(DIALOG_DATA) private bill: Bill,
    private dialogRef: DialogRef,
    private alertify: AlertsAndNotificationsService,
    private dataProvider: DataProvider,
    private dialog:Dialog,
    private billService:BillService,
    private printingService:PrinterService
  ) {
    this.allKots = JSON.parse(
      JSON.stringify(bill.kots.map((kot) => kot.toObject()))
    );
    this.allKots.forEach((kot) => {
      kot.products.forEach((product) => {
        product.selected = false;
      });
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  splitBill() {
    let products: any[] = [];
    let kots: KotConstructor[] = [];
    this.allKots.forEach((kot) => {
      let localProducts = [];
      kot.products.forEach((product) => {
        if (product.selected) {
          localProducts.push({ ...product, kot: kot });
        }
      });
      if (localProducts.length > 0) {
        let kotCopy = JSON.parse(JSON.stringify(kot));
        kotCopy.products = localProducts;
        kots.push(kotCopy);
      }
    });
    if (kots.length == 0 || kots[0].products.length == 0) {
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
    };
    let billConstructor: BillConstructor = {
      billing: billing,
      id: this.bill.id,
      kots: kots,
      mode: this.bill.mode,
      table: this.bill.table,
      tokens: this.bill.tokens,
      user: this.bill.user,
      createdDate: this.bill.createdDate,
      stage: 'active',
      customerInfo: {
        name: this.bill.customerInfo.name || '',
        phone: this.bill.customerInfo.phone || '',
        address: this.bill.customerInfo.address || '',
        deliveryName: this.bill.customerInfo.deliveryName || '',
        deliveryPhone: this.bill.customerInfo.deliveryPhone || '',
        gst: this.bill.customerInfo.gst || '',
      },
      orderNo: this.bill.orderNo,
      optionalTax: this.bill.optionalTax,
      instruction: this.bill.instruction || '',
      modifiedAllProducts: this.bill.modifiedAllProducts,
      billSplits: [],
      billReprints: [],
      billingMode: this.bill.billingMode,
    };
    calculateBill(billConstructor,this.dataProvider);
    this.splittedBills.push(billConstructor);
    // remove selected products from original bill
    this.allKots.forEach((kot) => {
      kot.products = kot.products.filter((product) => !product.selected);
    })
    // remove kots with no products
    this.allKots = this.allKots.filter((kot) => kot.products.length > 0);
  }

  settleBill(billConstructor: BillConstructor) {
    let dialog = this.dialog.open(SettleComponent,{data:billConstructor.billing.grandTotal});
    dialog.closed.subscribe((result: any) => {
    //  console.log('Result', result);
      if (result && billConstructor && result.settling && result.paymentMethods) {
        // billConstructor.settle(result.paymentMethods,'internal',result.detail || null);
        billConstructor.settlement = {
          additionalInfo: result.detail || null,
          payments: result.paymentMethods,
          time:Timestamp.now(),
          user:{
            access:this.dataProvider.currentBusinessUser.access.accessLevel,
            username:this.dataProvider.currentBusinessUser.name,
          }
        }
        billConstructor.stage = 'settled';
        calculateBill(billConstructor,this.dataProvider);
      }
    });
  }

  addDiscount(billConstructor: BillConstructor) {
    const dialog = this.dialog.open(AddDiscountComponent,{data:billConstructor})
    dialog.closed.subscribe((result: any) => {
    //  console.log("Result",result);
      if (typeof result == 'object' && this.dataProvider.currentBill) {
      //  console.log(result);
        billConstructor.billing.discount = result;
        calculateBill(billConstructor,this.dataProvider);
      }
    })
  }

  async saveSplittedBill() {
    if (this.splittedBills.length == 0) {
      this.alertify.presentToast('Please split the bill first');
      return;
    }
    if (this.allSettled){
      this.dataProvider.loading = true;
      let ids = await Promise.all(this.splittedBills.map(async (bill)=>{
        bill.table = bill.table.id || bill.table as any;
        this.printingService.printBill(bill.printableBillData);
        // console.log("Printing Bill",bill.printableBillData);
        let res = (await this.billService.saveSplittedBill(this.bill.id,bill)).id;
        //  console.log("Saved splitted bill");
        return res
      }))
      this.bill.settle(this.splittedBills.map(bill=>bill.settlement.payments).flat(),'internal',{
        splitBill:true,
        bills:ids
      });
      this.dataProvider.loading = false;
      this.dialogRef.close();
    }
  }

  get allSettled(){
    return this.splittedBills.every(bill=>bill.stage=='settled');
  }
}


export function calculateBill(bill: BillConstructor,dataProvider:DataProvider) {
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
        applicableDiscount += discount.value;
        discount.totalAppliedDiscount += Number(discount.value);
      } else {
        let discountValue = (bill.billing.subTotal / 100) * discount.value;
        applicableDiscount += discountValue;
        discount.totalAppliedDiscount += Number(discountValue);
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
  bill.billing.grandTotal = bill.billing.subTotal - applicableDiscount + totalApplicableTax;
  bill.printableBillData = getPrintableBillConstructor(
    bill,
    allProducts,
    dataProvider
  );
}