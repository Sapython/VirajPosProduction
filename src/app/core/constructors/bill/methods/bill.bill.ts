import { Timestamp } from '@angular/fire/firestore';
import { Bill } from '..';
import { Payment } from '../../../../types/payment.structure';
import { BillConstructor } from '../../../../types/bill.structure';
import { Product } from '../../../../types/product.structure';
import { Kot } from '../../kot/Kot';
import {
  CodeBaseDiscount,
  DirectFlatDiscount,
  DirectPercentDiscount,
} from '../../../../types/discount.structure';

export function setAsNonChargeable(
  name: string,
  contact: string,
  reason: string
) {
  this.billingMode = 'nonChargeable';
  this.nonChargeableDetail = {
    reason,
    time: Timestamp.now(),
    user: this.user,
    phone: contact,
    name,
  };
  this.calculateBill();
  this.updated.next();
}

export function setAsNormal(this: Bill) {
  this.billingMode = 'cash';
  this.nonChargeableDetail = undefined;
  this.calculateBill();
  this.updated.next();
}

export async function finalize(this: Bill) {
  this.dataProvider.manageKot = false;
  this.dataProvider.kotViewVisible = false;
  this.dataProvider.allProducts = true;
  // check if any kot is active
  if (this.kots.find((kot) => kot.stage === 'active')) {
    if (confirm('There are active KOTs. Do you want to finalize them?')) {
      this.finalizeAndPrintKot();
    }
  }
  if (this.totalProducts == 0) {
    alert('No products to finalize');
    return;
  }
  if (this.mode == 'online') {
  //  console.log('customer info', this.customerInfo);
    if (
      !(
        this.customerInfo.name &&
        this.customerInfo.phone &&
        this.customerInfo.address &&
        this.customerInfo.deliveryName &&
        this.customerInfo.deliveryPhone
      )
    ) {
      alert('Please fill customer details');
      return;
    }
  }
  this.stage = 'finalized';
  let data = this.toObject();
  // this.databaseService.updateBill(data);
  if (this.dataProvider.printBillAfterFinalize) {
    this.printBill();
  } else {
    let res = await this.dataProvider.confirm(
      'Do you want to print bill?',
      [1],
      { buttons: ['Save', 'Save And Print'] }
    );
    if (res) {
      this.printBill();
    }
  }

  this.updated.next();
  if (this.dataProvider.showTableOnBillAction) {
    this.dataProvider.openTableView.next(true);
  }
}

export async function setInstruction(this: Bill) {
  this.instruction =
    (await this.dataProvider.prompt('Enter instruction', {
      value: this.instruction,
      multiline: false,
    })) || '';
//  console.log('THIS INSTRUCTION', this.instruction);
  this.calculateBill();
}

export async function printBill(this: Bill) {
  this.printingService.printBill(this.printableBillData);
}

export async function settle(
  this: Bill,
  payments: Payment[],
  type: 'internal' | 'external',
  additionalInfo: any,
  splitSave?: boolean
) {
  this.calculateBill();
  // update every product and increase their sales counter by their quantity
  let products: Product[] = [];
  let allProducts = this.kots.reduce((acc, cur) => {
    return acc.concat(cur.products);
  }, products);
  allProducts.forEach((product) => {
    if (!product.sales) {
      product.sales = 0;
    }
    product.sales += product.quantity;
  });
  if (!this.billNo) {
    if (this.nonChargeableDetail) {
      this.billNo = 'NC-' + this.dataProvider.ncBillToken.toString();
      this.dataProvider.ncBillToken++;
      this.analyticsService.addNcBillToken();
    } else {
      if (this.mode == 'dineIn') {
        (this.billNo = this.dataProvider.billToken.toString()),
        this.dataProvider.billToken++;
        this.analyticsService.addBillToken();
      } else if (this.mode == 'takeaway') {
        this.billNo = this.dataProvider.takeawayToken.toString();
        this.dataProvider.takeawayToken++;
        this.analyticsService.addTakeawayToken();
      } else if (this.mode == 'online') {
        (this.billNo = this.dataProvider.onlineTokenNo.toString()),
        this.dataProvider.onlineTokenNo++;
        this.analyticsService.addOnlineToken();
      } else {
        (this.billNo = this.dataProvider.billToken.toString()),
        this.dataProvider.billToken++;
        this.analyticsService.addBillToken();
      }
    }
  }
  // update in databse
  this.billService.addSales(allProducts.map((product) => product.id));
  // this.stage = 'settled';
  this.settlement = {
    payments: payments,
    time: Timestamp.now(),
    user: this.user,
    additionalInfo: additionalInfo,
  };
  // console.log(
  //   'this.dataProvider.printBillAfterFinalize',
  //   this.dataProvider.printBillAfterFinalize
  // );
  if (splitSave) {
    if (this.dataProvider.printBillAfterFinalize) {
      this.printingService.printBill(this.printableBillData);
    } else {
      let res = await this.dataProvider.confirm(
        'Do you want to print bill?',
        [1],
        { buttons: ['Save', 'Save And Print'] }
      );
      if (res) {
        this.printingService.printBill(this.printableBillData);
      }
    }
  }
  if (this.nonChargeableDetail) {
    this.analyticsService.addSales(
      this.billing.grandTotal,
      'nonChargeableSales'
    );
  } else if (this.mode == 'dineIn') {
    this.analyticsService.addSales(this.billing.grandTotal, 'dineInSales');
  } else if (this.mode == 'takeaway') {
    this.analyticsService.addSales(this.billing.grandTotal, 'takeawaySales');
  } else if (this.mode == 'online') {
    this.analyticsService.addSales(this.billing.grandTotal, 'onlineSales');
  }
  this.stage = 'settled';
  this.table?.clearTable();
  if (type == 'internal') {
    this.dataProvider.currentBill = undefined;
    this.dataProvider.currentTable = undefined;
  }
  this.dataProvider.totalSales += this.billing.grandTotal;
  this.updated.next();
  if (this.dataProvider.showTableOnBillAction) {
    this.dataProvider.openTableView.next(true);
  }
  console.log('Bill settled');
  
  return this.billNo;
}

export function merge(this: Bill, bill: Bill) {
  bill.kots.forEach((kot) => {
    this.addKot(kot);
  });
  bill.clearAllKots();
  // clear the table
  bill.table.bill = null;
  bill.table.status = 'available';
  this.updated.next();
}

export function splitBill(this: Bill, bills: BillConstructor[]) {}

export function breakBill(
  this: Bill,
  kots: Kot[],
  discounts: (CodeBaseDiscount | DirectFlatDiscount | DirectPercentDiscount)[]
) {
  // now create a new billConstructor and add all the kots to it then calculate the bill and return the billConstructor
  // let newBill:BillConstructor = {
  //   id: this.id,
  // }
}
