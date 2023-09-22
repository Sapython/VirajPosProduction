import { Timestamp, increment } from '@angular/fire/firestore';
import { Bill } from '..';
import { Payment, PaymentMethod } from '../../../../types/payment.structure';
import { BillConstructor } from '../../../../types/bill.structure';
import { Product } from '../../../../types/product.structure';
import { Kot } from '../../kot/Kot';
import {
  CodeBaseDiscount,
  DirectFlatDiscount,
  DirectPercentDiscount,
} from '../../../../types/discount.structure';
import { ApplicableCombo } from '../../comboKot/comboKot';
import { User } from '../../user/User';

export function setAsNonChargeable(
  this: Bill,
  name: string,
  contact: string,
  reason: string,
  user: User,
  elevatedUser: string,
) {
  this.billingMode = 'nonChargeable';
  this.nonChargeableDetail = {
    reason,
    time: Timestamp.now(),
    user: user,
    elevatedUser: elevatedUser,
    phone: contact,
    name,
  };
  this.billService.addActivity(this, {
    message: `Bill set as non chargeable by ${this.user.username}`,
    type: 'billNC',
    user: this.user.username,
    data: this.nonChargeableDetail,
  });
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
  });
  this.calculateBill();
  this.updated.next();
}

export async function finalize(this: Bill, noTable?: boolean,onHold?:boolean) {
  this.dataProvider.manageKot = false;
  this.dataProvider.kotViewVisible = false;
  this.dataProvider.allProducts = true;
  // check if any kot is active
  if (this.kots.find((kot) => kot.stage === 'active')) {
    if (
      await this.dataProvider.confirm(
        'There are active KOTs. Do you want to finalize them?',
        [1],
      )
    ) {
      await this.finalizeAndPrintKot(true);
    }
  }
  if (this.totalProducts == 0) {
    await alert('No products to finalize');
    return;
  }
  console.log("QuickMethod: Finalize",onHold);
  if (onHold) {
    this.stage = 'hold';
  } else {
    this.stage = 'finalized';
  }
  this.dataProvider.loading = true;
  this.updateToFirebase();
  this.dataProvider.loading = false;
  if (this.dataProvider.printBillAfterFinalize) {
    this.printBill();
  } else if (
    !this.dataProvider.printBillAfterFinalize &&
    this.dataProvider.confirmBeforeFinalizePrint
  ) {
    let res = await this.dataProvider.confirm(
      'Do you want to print bill?',
      [1],
      { buttons: ['Save', 'Save And Print'] },
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
  if (this.dataProvider.showTableOnBillAction && !noTable) {
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
    data: { instruction: this.instruction },
    user: this.user.username,
  });
  this.calculateBill();
}

export async function printBill(this: Bill) {
  this.billService.addActivity(this, {
    message: `Bill printed by ${this.user.username}`,
    type: 'billPrinted',
    data: this.printableBillData,
    user: this.user.username,
  });
  this.printingService.printBill(this.printableBillData);
}

function recheckCUstomerLoyaltyStatus(this:Bill){
  // if (this.customerInfo.phone && this.customerInfo.phone.length == 10) {
  //   // fetch customer from database
  //   let await = this.customerService.
  // }
}

export async function settle(
  this: Bill,
  payments: Payment[],
  type: 'internal' | 'external',
  additionalInfo: any,
  splitSave?: boolean,
  quickSettle?:PaymentMethod,
  noTable?: boolean,
  noDialogs?: boolean,
) {
  // ** RECHECKER starts here
  // check if previous stages are completed
  if (this.dataProvider.directSettle && !noDialogs) {
    if (this.kots.find((kot) => kot.stage === 'active')) {
      await this.finalizeAndPrintKot(true);
    }
    await this.finalize(true);
  }
  // recalculate bill
  this.calculateBill();
  // update in database
  let requiredBillNumber;
  if (!this.billNo) {
    if(quickSettle){
      var method = this.dataProvider.paymentMethods.find((method) => method.id == quickSettle.id);
      if (method){
        if (!quickSettle.billNo){
          quickSettle.billNo = 1;
        }
        this.dataProvider.loading = true;
        requiredBillNumber = await this.billService.getPaymentMethodBillNumber(method.id)
        console.log("SettleBillMethod: after increment bill number",requiredBillNumber);
        this.dataProvider.loading = false;
      }
    } else {
      if (this.nonChargeableDetail) {
        this.dataProvider.loading = true;
        requiredBillNumber = await this.billService.getNcBillNumber();
        this.dataProvider.loading = false;
      } else {
        if (this.mode == 'dineIn') {
          this.dataProvider.loading = true;
          requiredBillNumber = await this.billService.getNormalBillNumber();
          this.dataProvider.loading = false;
        } else if (this.mode == 'takeaway') {
          requiredBillNumber = this.table.tableNo.toString();
        } else if (this.mode == 'online') {
          requiredBillNumber = this.table.tableNo.toString();
        } else {
          this.dataProvider.loading = true;
          requiredBillNumber = await this.billService.getNormalBillNumber();
          this.dataProvider.loading = false;
        }
      }
    }
  }
  console.log("SettleBillNum: Final number",requiredBillNumber);
  this.billNo = requiredBillNumber;
  this.stage = 'settled';
  this.settlement = {
    elevatedUser: this.settlementElevatedUser,
    payments: payments,
    time: Timestamp.now(),
    user: this.user,
    additionalInfo: additionalInfo,
  };
  this.dataProvider.loading = true;
  this.updateToFirebase();
  this.dataProvider.loading = false;
  // print the bill after saving it to database
  if (splitSave) {
    if (this.dataProvider.printBillAfterSettle) {
      await this.printingService.printBill(this.printableBillData);
    } else if (
      !this.dataProvider.printBillAfterSettle &&
      this.dataProvider.confirmBeforeSettlementPrint && !noDialogs
    ) {
      let res = await this.dataProvider.confirm(
        'Do you want to print bill?',
        [1],
        { buttons: ['Save', 'Save And Print'] },
      );
      if (res) {
        await this.printingService.printBill(this.printableBillData);
      }
    }
  }
  if (this.dataProvider.showTableOnBillAction && !noTable) {
    this.dataProvider.openTableView.next(true);
  }
  // set the loyalty points for the customers
  if (this.customerInfo.phone) {
    console.log('Found customer phone');
    this.customerService.updateCustomer(
      {
        address: this.customerInfo.address,
        gst: this.customerInfo.gst,
        name: this.customerInfo.name,
        phone: this.customerInfo.phone,
      },
      this,
    );
    console.log('Customer info', this.customerInfo);
  }


  // ** ANALYTICS starts here
  let productSales: {
    item: string;
    sales: number;
  }[] = [];
  this.allFinalProducts.forEach((product) => {
    if (product.id.startsWith('CUSTOM-')) {
      return undefined;
    }
    if (product.itemType == 'product') {
      let find = productSales.find((p) => p.item == product.id);
      if (find) {
        find.sales += product.quantity;
      } else {
        productSales.push({
          item: product.id,
          sales: product.quantity,
        });
      }
    } else if (product.itemType == 'combo') {
      product.allProducts.forEach((product) => {
        let find = productSales.find((p) => p.item == product.id);
        if (find) {
          find.sales += product.quantity;
        } else {
          productSales.push({
            item: product.id,
            sales: product.quantity,
          });
        }
      });
    }
  });


  // ** Add all products sales 
  this.billService.addSales(productSales);
  this.billService.provideAnalytics().logBill(this);
  this.dataProvider.totalSales += this.billing.grandTotal;
  // add activity for bill
  this.billService.addActivity(this, {
    type: 'billSettled',
    message: 'Bill settled by ' + this.user.username,
    data: this.settlement,
    user: this.user.username,
  });


  // Bill is updated till here 
  if (this.nonChargeableDetail) {
    this.analyticsService.addSales(this.billing.subTotal, 'nonChargeableSales',this.createdDate.toDate());
  } else if (this.mode == 'dineIn') {
    this.analyticsService.addSales(this.billing.grandTotal, 'dineInSales',this.createdDate.toDate());
  } else if (this.mode == 'takeaway') {
    this.analyticsService.addSales(this.billing.grandTotal, 'takeawaySales',this.createdDate.toDate());
  } else if (this.mode == 'online') {
    this.analyticsService.addSales(this.billing.grandTotal, 'onlineSales',this.createdDate.toDate());
  }


  // ** clear values and reset UI
  this.table?.clearTable();
  if (type == 'internal') {
    this.dataProvider.currentBill = undefined;
    this.dataProvider.currentTable = undefined;
  }
  this.dataProvider.resetKotView.next(true);
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
  discounts: (CodeBaseDiscount | DirectFlatDiscount | DirectPercentDiscount)[],
) {
  // now create a new billConstructor and add all the kots to it then calculate the bill and return the billConstructor
  // let newBill:BillConstructor = {
  //   id: this.id,
  // }
}
