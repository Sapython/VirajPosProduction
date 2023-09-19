import { Timestamp } from '@angular/fire/firestore';
import { Bill } from '..';
import { Product } from '../../../../types/product.structure';
import { Kot } from '../../kot/Kot';

export function lineCancelled(this: Bill, item: Product, event: any, kot: Kot) {
  //  console.log('line cancelled', item, event);
  if (event.type == 'unmade') {
    kot.unmade = true;
  }
  item.cancelled = true;
  this.printKot(kot, 'editedKot');
  this.cancelledProducts.push({ product: item, kot: kot.id });
  // remove product from kot
  item.cancelled = true;
  this.billService.addActivity(this, {
    type: 'lineCancelled',
    message: 'Line cancelled by ' + this.user.username,
    user: this.user.username,
    data: { item, kot: kot.toObject() },
  });
  this.updateToFirebase();
  // kot.products = kot.products.filter((product) => product.id !== item.id);
  this.calculateBill();
}
export function cancel(this: Bill, reason: string, phone: string,table = this.dataProvider.currentTable) {
  console.log("Checking for cancellation",this.dataProvider.deleteCancelledBill,this.stage);
  if (this.dataProvider.deleteCancelledBill && (this.stage == 'finalized' || this.stage == 'hold')){
    console.log('deleting bill');
    this.deleteBill();
    return;
  }
  this.stage = 'cancelled';
  this.cancelledReason = {
    reason: reason,
    phone: phone,
    time: Timestamp.now(),
    user: this.user,
  };
  // remove any active kot
  this.kots = this.kots.filter((kot) => kot.stage !== 'active');
  this.dataProvider.currentBill = undefined;
  if (table.type == 'table') {
    table!.status = 'available';
    table!.bill = null;
  } else {
    table!.completed = true;
  }
  table = undefined;
  if (this.dataProvider.showTableOnBillAction) {
    this.dataProvider.openTableView.next(true);
  }
  this.billService.addActivity(this, {
    type: 'billCancelled',
    message: 'Bill cancelled by ' + this.user.username,
    user: this.user.username,
    data: {reason:this.cancelledReason},
  });
  this.updated.next();
}

export function deleteBill(this:Bill) {
  this.billService.deleteBill(this.id);
  this.dataProvider.currentBill = undefined;
  this.table.clearTable();
  this.dataProvider.currentTable = undefined;
  this.dataProvider.openTableView.next(true);
}