import { Timestamp, runTransaction } from '@angular/fire/firestore';
import { Bill } from '..';
import { Product } from '../../../../types/product.structure';
import { Kot } from '../../kot/Kot';
import { PrintableKot } from '../../../../types/kot.structure';
import { ApplicableCombo } from '../../comboKot/comboKot';

var debug: boolean = true;

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

export function editKot(this: Bill, kot: Kot, reason: string) {
  // console.log('EDITED KOT REASON', reason);

  if (this.currentKot?.stage === 'active') {
    if (
      confirm(
        'You are already editing a kot. Do you want to discard the changes and edit this kot?',
      )
    ) {
      this.editKotMode = {
        newKot: structuredClone(kot.products),
        previousKot: kot.products,
        kot: kot,
        kotIndex: this.kots.findIndex((localKot) => localKot.id == kot.id) || 0,
      };
      //  console.log('edit kot mode 1', this.editKotMode);
      this.dataProvider.manageKot = false;
      this.dataProvider.manageKotChanged.next(false);
      let kotObject = kot.toObject();
      let activityData = {
        id: kotObject.id,
        table: this.table.id,
        products: kotObject.products.map((prod) => {
          return {
            id: prod.id,
            name: prod.name,
            quantity: prod.quantity,
            price: prod.price,
            instruction: prod.instruction,
            cancelled: prod.cancelled,
            itemType: prod.itemType,
          };
        }),
      };

      this.billService.addActivity(this, {
        type: 'kotEdited',
        message: 'Kot edited by ' + this.user.username,
        user: this.user.username,
        data: {
          editReason: reason,
          ...activityData,
        },
      });
      this.updated.next();
    } else {
      return;
    }
  } else {
    let clonedArray: (Product | ApplicableCombo)[] = [];
    kot.products.forEach((product) => {
      clonedArray.push(structuredClone(product));
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
    let kotObject = kot.toObject();
    let activityData = {
      id: kotObject.id,
      table: this.table.id,
      products: kotObject.products.map((prod) => {
        return {
          id: prod.id,
          name: prod.name,
          quantity: prod.quantity,
          price: prod.price,
          instruction: prod.instruction,
          cancelled: prod.cancelled,
          itemType: prod.itemType,
        };
      }),
    };
    this.billService.addActivity(this, {
      type: 'kotEdited',
      message: 'Kot edited by ' + this.user.username,
      user: this.user.username,
      data: { ...activityData, editReason: reason },
    });
    this.updated.next();
  }
}

export async function finalizeAndPrintKot(this: Bill, noTable?: boolean) {
  console.log("Checking for first kot",this.table.status);

  if (this.editKotMode != null) {
    let kotIndex = this.kots.findIndex(
      (kot) => this.editKotMode && kot.id === this.editKotMode.kot.id,
    );
    //  console.log('Kot index', kotIndex);
    if (kotIndex != -1) {
      let cancelledProducts: (Product | ApplicableCombo)[] = this.kots[
        kotIndex
      ].products.map((product) => {
        product.cancelled = true;
        return product;
      });
      this.editKotMode.newKot.forEach((product) => {
        product.cancelled = false;
      });
      let incomplete = this.kots[kotIndex].products.some((product) => {
        if (product.itemType == 'combo') {
          return product.incomplete;
        } else {
          return false;
        }
      });
      if (incomplete) {
        await alert('Please complete the combo before finalizing the kot');
        return;
      }
      this.kots[kotIndex].products = [
        ...cancelledProducts,
        ...this.editKotMode.newKot,
      ];
      this.kots[kotIndex].stage = 'finalized';
      //  console.log('Active kot', this.kots[kotIndex]);
      this.printKot(this.kots[kotIndex], 'editedKot');
      this.kots[kotIndex].products = this.editKotMode.newKot;
    }
    this.editKotMode = null;
    this.dataProvider.kotViewVisible = true;
  } else {
    let activeKot = this.kots.find(
      (value) => value.stage === 'active' || value.stage == 'edit',
    );
    //  console.log('info =>', activeKot);

    if (activeKot) {
      let incomplete = activeKot.products.some((product) => {
        if (product.itemType == 'combo') {
          return product.incomplete;
        } else {
          return false;
        }
      });
      if (incomplete) {
        await alert('Please complete the combo before finalizing the kot');
        return;
      }
      this.dataProvider.loading = true;
      if (this.table.status == 'available') {
        if (this.table.type == 'token'){
          let res = await this.billService.getOrderKotTakeawayTokenNumber();
          this.table.attachBill(this,res.takeawayTokenNumber);
          activeKot.id = res.kotTokenNumber;
          this.orderNo = res.orderTokenNumber;
        } else if (this.table.type == 'online'){
          let res = await this.billService.getOrderKotOnlineTokenNumber();
          this.table.attachBill(this,res.onlineTokenNumber);
          activeKot.id = res.kotTokenNumber;
          this.orderNo = res.orderTokenNumber;
        } else if (this.table.type == 'table' || this.table.type == 'room'){
          this.table.attachBill(this,undefined);
        }
      } else {
        if (!this.orderNo) {
          let res = await this.billService.getOrderAndKotNumber();
          activeKot.id = res.kotTokenNumber;
          this.orderNo = res.orderTokenNumber;
        } else {
          activeKot.id = await this.billService.getKotTokenNumber();
        }
      }
      this.dataProvider.loading = false;
      console.log('Kot id', activeKot.id);
      activeKot.stage = 'finalized';
      activeKot.createdDate = Timestamp.now();
      this.updated.next();
      if (this.kots.length > 1) {
        if (this.nonChargeableDetail) {
          // running nonchargeable kot
          this.billService.provideAnalytics().logKot(activeKot, 'new');
          await this.printKot(activeKot, 'runningNonChargeable');
        } else {
          this.billService.provideAnalytics().logKot(activeKot, 'new');
          // running chargeable kot
          //  console.log('running chargeable');
          await this.printKot(activeKot, 'runningChargeable');
        }
      } else {
        if (this.nonChargeableDetail) {
          // first nonchargeable kot
          this.billService.provideAnalytics().logKot(activeKot, 'new');
          await this.printKot(activeKot, 'firstNonChargeable');
        } else {
          // first chargeable kot
          this.billService.provideAnalytics().logKot(activeKot, 'new');
          await this.printKot(activeKot, 'firstChargeable');
        }
      }
      //  console.log('Must have printed');
      this.dataProvider.kotViewVisible = true;
    } else {
      await alert('No active kot found');
    }
  }
  if (this.dataProvider.showTableOnBillAction && !noTable) {
    this.dataProvider.openTableView.next(true);
  }
  this.calculateBill();
}

export async function deleteKot(this: Bill, kot: Kot) {
  kot.stage = 'cancelled';
  this.updated.next();
  kot.products.forEach((product) => {
    product.cancelled = true;
  });
  let kotObject = kot.toObject();
  let activityData = {
    id: kotObject.id,
    table: this.table.id,
    products: kotObject.products.map((prod) => {
      return {
        id: prod.id,
        name: prod.name,
        quantity: prod.quantity,
        price: prod.price,
        instruction: prod.instruction,
        cancelled: prod.cancelled,
        itemType: prod.itemType,
      };
    }),
  };
  this.billService.addActivity(this, {
    type: 'kotCancelled',
    message: 'Kot cancelled by ' + this.user.username,
    user: this.user.username,
    data: {
      ...activityData,
      cancelReason: 'Cancelled by ' + this.user.username,
    },
  });
  this.billService.provideAnalytics().logKot(kot, 'cancelled');
  await this.printKot(kot, 'cancelledKot');
  this.calculateBill();
  this.updated.next();
  this.dataProvider.kotViewVisible = true;
  this.dataProvider.manageKot = false;
  this.dataProvider.manageKotChanged.next(false);
  this.dataProvider.allProducts = false;
}

export async function printKot(
  this: Bill,
  kot: Kot,
  mode:
    | 'firstChargeable'
    | 'cancelledKot'
    | 'editedKot'
    | 'runningNonChargeable'
    | 'runningChargeable'
    | 'firstNonChargeable'
    | 'reprintKot'
    | 'online',
  reason?: string,
) {
  kot.mode = mode || 'firstChargeable';
  if (mode == 'reprintKot') {
    if (!reason) {
      throw new Error('Reason is required for reprint');
      return;
    }
    this.kotReprints.push({
      reprintReason: reason,
      time: Timestamp.now(),
      user: this.user,
    });
  }
  //  console.log("kot.products",kot.products);
  let data: PrintableKot = {
    // date in dd/mm/yyyy format
    date: kot.createdDate.toDate().toLocaleDateString('en-GB'),
    // time in 12 hour format
    time: kot.createdDate.toDate().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }),
    user: kot.user.username,
    orderNo: this.orderNo,
    mode: mode,
    billingMode: this.mode,
    note: kot.note,
    token: kot.id,
    products: kot.getAllProducts().map((product) => {
      return {
        id: product.id,
        name: product.name,
        instruction: product.instruction || null,
        quantity: product.quantity,
        edited: product.cancelled,
        category: product.category,
        specificPrinter: product.specificPrinter || null,
      };
    }),
    table: this.table.id,
  };
  this.dataProvider.currentApplicableCombo = undefined;
  this.billService.addActivity(this, {
    type: 'kotPrinted',
    message: 'Kot finalized by ' + this.user.username,
    user: this.user.username,
    data: data,
  });
  if (debug) console.log('Kot data', data);
  await this.printingService.printKot(data);
  //  console.log('Send to service');
}

export function checkCanPrintKot(this: Bill) {
  let hasAnyActiveKot = this.kots.some(
    (kot) => kot.stage == 'active' || kot.stage == 'edit',
  );
  // check if any product of item type combo is incomplete if yes return false
  let isEveryProductValid = this.kots.every((kot) => {
    return kot.products.every((product) => {
      if (product instanceof ApplicableCombo) {
        return product.incomplete;
      } else {
        return true;
      }
    });
  });
  return hasAnyActiveKot && isEveryProductValid;
}
