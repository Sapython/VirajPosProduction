import { Timestamp } from '@angular/fire/firestore';
import { Bill } from '..';
import { Product } from '../../../../types/product.structure';
import { Kot } from '../../kot/Kot';
import { PrintableKot } from '../../../../types/kot.structure';

export function addKot(this: Bill, kot: Kot) {
  this.kots.push(kot);
  this.tokens.push(this.dataProvider.kotToken.toString());
  this.dataProvider.kotToken++;
  this.billing.subTotal = this.kots.reduce((acc, cur) => {
    return (
      acc +
      cur.products.reduce((acc, cur) => {
        return acc + cur.price * cur.quantity;
      }, 0)
    );
  }, 0);
  this.billing.grandTotal = this.billing.subTotal;
  this.updated.next();
}

export function clearAllKots(this: Bill) {
  this.kots = [];
  this.billing.subTotal = 0;
  this.billing.grandTotal = 0;
  this.updated.next();
}

export function editKot(this: Bill, kot: Kot, reason) {
  if (this.currentKot?.stage === 'active') {
    if (
      confirm(
        'You are already editing a kot. Do you want to discard the changes and edit this kot?'
      )
    ) {
      this.editKotMode = {
        newKot: kot.products.slice(),
        previousKot: kot.products,
        kot: kot,
        kotIndex: this.kots.findIndex((localKot) => localKot.id == kot.id) || 0,
      };
    //  console.log('edit kot mode 1', this.editKotMode);
      this.dataProvider.manageKot = false;
      this.dataProvider.manageKotChanged.next(false);
      this.updated.next();
    } else {
      return;
    }
  } else {
    let clonedArray: Product[] = [];
    kot.products.forEach((product) => {
      clonedArray.push({ ...product });
    });
    this.editKotMode = {
      newKot: clonedArray,
      previousKot: kot.products,
      kot: kot,
      kotIndex: this.kots.findIndex((localKot) => localKot.id == kot.id) || 0,
    };
    // finalize the kot
  //  console.log('edit kot mode', this.editKotMode);
    this.dataProvider.manageKot = false;
    this.dataProvider.manageKotChanged.next(false);
    this.updated.next();
  }
}

export function finalizeAndPrintKot(this: Bill) {
  if (this.editKotMode != null) {
    console.log(
      'Old kot',
      this.editKotMode.previousKot,
      'New kot',
      this.editKotMode.newKot
    );
    let kotIndex = this.kots.findIndex(
      (kot) => this.editKotMode && kot.id === this.editKotMode.kot.id
    );
  //  console.log('Kot index', kotIndex);
    if (kotIndex != -1) {
      let cancelledProducts:Product[] = this.kots[kotIndex].products.map((product)=>{
        return {
          ...product,
          cancelled:true,
        }
      })
      this.editKotMode.newKot.forEach((product)=>{
        product.cancelled = false;
      })
      this.kots[kotIndex].products = [...cancelledProducts,...this.editKotMode.newKot];
      this.kots[kotIndex].stage = 'finalized';
    //  console.log('Active kot', this.kots[kotIndex]);
      this.printKot(this.kots[kotIndex],'editedKot')
      this.kots[kotIndex].products = this.editKotMode.newKot;
    }
    this.editKotMode = null;
    this.dataProvider.kotViewVisible = true;
  } else {
    let activeKot = this.kots.find(
      (value) => value.stage === 'active' || value.stage == 'edit'
    );
  //  console.log('info =>', activeKot);

    if (activeKot) {
      activeKot.id = this.dataProvider.kotToken.toString();
      this.dataProvider.kotToken++;
      this.analyticsService.addKitchenToken();
      activeKot.stage = 'finalized';
    //  console.log('Active kot', activeKot);
      this.analyticsService.addKitchenToken();
      activeKot.createdDate = Timestamp.now();
      this.updated.next();
      if (this.kots.length > 1) {
        if (this.nonChargeableDetail) {
          // running nonchargeable kot
          this.printKot(activeKot, 'runningNonChargeable');
        } else {
          // running chargeable kot
        //  console.log('running chargeable');
          this.printKot(activeKot, 'runningChargeable');
        }
      } else {
        if (this.nonChargeableDetail) {
          // first nonchargeable kot
          this.printKot(activeKot, 'firstNonChargeable');
        } else {
          // first chargeable kot
          this.printKot(activeKot, 'firstChargeable');
        }
      }
    //  console.log('Must have printed');
      this.dataProvider.kotViewVisible = true;
    } else {
      alert('No active kot found');
    }
  }
  if (this.dataProvider.showTableOnBillAction) {
    this.dataProvider.openTableView.next(true);
  }
  this.calculateBill();
}

export function deleteKot(this: Bill, kot: Kot) {
  kot.stage = 'cancelled';
  this.updated.next();
  kot.products.forEach((product) => {
    product.cancelled = true;
  })
  this.printKot(kot,'cancelledKot');
  this.calculateBill();
  this.updated.next();
  this.dataProvider.kotViewVisible = true;
  this.dataProvider.manageKot = false;
  this.dataProvider.manageKotChanged.next(false);
  this.dataProvider.allProducts = false;
}

export function printKot(
  this: Bill,
  kot: Kot,
  mode:
    'firstChargeable'
    | 'cancelledKot'
    | 'editedKot'
    | 'runningNonChargeable'
    | 'runningChargeable'
    | 'firstNonChargeable'
    | 'reprintKot'
    | 'online',
  reason?: string
) {
  kot.mode = mode || 'firstChargeable';
  if (mode == 'reprintKot') {
    if (!reason){
      throw new Error('Reason is required for reprint');
      return;
    }
    this.kotReprints.push({
      reprintReason: reason,
      time: Timestamp.now(),
      user: this.user,
    });
  }
  if (!this.orderNo) {
    this.orderNo = this.dataProvider.orderTokenNo.toString();
    this.dataProvider.orderTokenNo++;
    this.analyticsService.addOrderToken();
  }
//  console.log("kot.products",kot.products);
  let data:PrintableKot = {
    date:kot.createdDate.toDate().toLocaleDateString(),
    time:kot.createdDate.toDate().toLocaleTimeString(),
    orderNo:this.orderNo,
    mode:mode,
    billingMode:this.mode,
    token:kot.id,
    products:kot.products.map((product)=>{
      return {
        name: product.name,
        instruction:product.instruction,
        quantity:product.quantity,
        edited:product.cancelled,
        category:product.category
      }
    }),
    table:this.table.id,
  }
//  console.log("Kot data",data);
  this.printingService.printKot(data);
//  console.log('Send to service');
}
