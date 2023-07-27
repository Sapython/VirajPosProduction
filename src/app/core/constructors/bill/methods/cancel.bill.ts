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
  this.printKot(
    kot,
    'editedKot'
  );
  this.cancelledProducts.push({ product: item, kot: kot.id });
  // remove product from kot
  item.cancelled = true;
  this.billService.addActivity(this, {
    type: 'lineCancelled',
    message: 'Line cancelled by ' + this.user.username,
    user: this.user.username,
    data: { item, kot:kot.toObject() },
  });
  this.updateToFirebase();
  // kot.products = kot.products.filter((product) => product.id !== item.id);
  this.calculateBill();
}
export function cancel(this: Bill, reason: string, phone: string) {
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
  if (this.dataProvider.currentTable.type == 'table') {
    this.dataProvider.currentTable!.status = 'available';
    this.dataProvider.currentTable!.bill = null;
  } else {
    this.dataProvider.currentTable!.completed = true;
  }
  this.dataProvider.currentTable = undefined;
  if (this.dataProvider.showTableOnBillAction) {
    this.dataProvider.openTableView.next(true);
  }
  this.billService.addActivity(this, {
    type: 'billCancelled',
    message: 'Bill cancelled by ' + this.user.username,
    user: this.user.username,
  });
  this.updated.next();
}
