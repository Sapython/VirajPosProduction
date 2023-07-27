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
import { ApplicableCombo } from '../../comboKot/comboKot';

export function setAsNonChargeable(this:Bill,
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
  this.billService.addActivity(this, {
    message: `Bill set as non chargeable by ${this.user.username}`,
    type: 'billNC',
    user: this.user.username,
    data:this.nonChargeableDetail,
  })
  this.calculateBill();
  this.updated.next();
}

export function setAsNormal(this: Bill) {
  this.billingMode = 'cash';
  this.nonChargeableDetail = undefined;
  this.billService.addActivity(this, {
    message: `Bill set as normal by ${this.user.username}`,
    type: 'billNormal',
    user: this.user.username,
  })
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
  this.billService.addActivity(this, {
    message: `Bill finalized by ${this.user.username}`,
    type: 'billFinalized',
    user: this.user.username,
  });
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
  this.billService.addActivity(this, {
    message: `Instruction set by ${this.user.username}`,
    type: 'instructionSet',
    user: this.user.username,
  });
  this.calculateBill();
}

export async function printBill(this: Bill) {
  this.billService.addActivity(this, {
    message: `Bill printed by ${this.user.username}`,
    type: 'billPrinted',
    user: this.user.username,
  });
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
  // return
  // TODO to be refixed
  let products: (Product|ApplicableCombo)[] = [];
  let allProducts = this.kots.reduce((acc, cur) => {
    return acc.concat(cur.products);
  }, products);
  allProducts.forEach((product) => {
    if (product.itemType == 'product') {
      if (!product.sales) {
        product.sales = 0;
      }
      product.sales += product.quantity;
    }
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
        // this.dataProvider.takeawayToken++;
        // this.analyticsService.addTakeawayToken();
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
  // update in database
  // TODO to be refixed
  this.billService.addSales(allProducts.map((product) => {
    if (product.itemType == 'product') {
      return product.id;
    } else if (product.itemType == 'combo') {
      return product.selectedProductsIds;
    }
  }).flat());
  this.stage = 'settled';
  this.settlement = {
    payments: payments,
    time: Timestamp.now(),
    user: this.user,
    additionalInfo: additionalInfo,
  };
  console.log(
    'this.dataProvider.printBillAfterFinalize',
    this.dataProvider.printBillAfterFinalize
  );
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
  this.billService.provideAnalytics().logBill(this);
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
  if (this.customerInfo.phone){
    let customer = this.dataProvider.customers.find((customer) => customer.phone == this.customerInfo.phone);
    if (customer){
      console.log('Customer found updating', customer);
      // check if any of the details are different
      if (customer.name != this.customerInfo.name || customer.address != this.customerInfo.address || customer.gst != this.customerInfo.gst){
        // update the customer
        this.customerService.updateCustomer({
          address:this.customerInfo.address,
          gst:this.customerInfo.gst,
          name:this.customerInfo.name,
          phone:this.customerInfo.phone,
        },this);
      }
    } else {
      console.log('Added as new customer info', this.customerInfo);
      this.customerService.addCustomer({
        address:this.customerInfo.address,
        gst:this.customerInfo.gst,
        name:this.customerInfo.name,
        phone:this.customerInfo.phone,
      },this);
    }
    console.log('Customer info', this.customerInfo);
  }
  this.billService.addActivity(this, {
    type: 'billSettled',
    message: 'Bill settled by ' + this.user.username,
    user: this.user.username,
  });

  this.customerService.addLoyaltyPoint(this)
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
