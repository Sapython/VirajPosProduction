import { Bill } from '..';
import { BillConstructor } from '../../../../types/bill.structure';
import { KotConstructor } from '../../../../types/kot.structure';
import { Product } from '../../../../types/product.structure';
import { UserManagementService } from '../../../services/auth/user/user-management.service';
import { CustomerService } from '../../../services/customer/customer.service';
import { AnalyticsService } from '../../../services/database/analytics/analytics.service';
import { BillService } from '../../../services/database/bill/bill.service';
import { PrinterService } from '../../../services/printing/printer/printer.service';
import { DataProvider } from '../../../services/provider/data-provider.service';
import { Kot } from '../../kot/Kot';
import { Table } from '../../table/Table';

export function firebaseUpdate(this: Bill) {
  if (this.id) {
    this.billService.getBillSubscription(this.id).subscribe((bill) => {
      this.billSubscriptionCallerStarted = true;
      //  console.log('bill changed', bill);
      //  && (!this.dataProvider.currentBill || this.dataProvider.currentBill.id != bill['id'])
      if (bill) {
        this.stage = bill['stage'];
        this.billNo = bill['billNo'];
        this.orderNo = bill['orderNo'];
        this.createdDate = bill['createdDate'];
        this.customerInfo = bill['customerInfo'];
        this.device = bill['device'];
        this.mode = bill['mode'];
        this.menu = bill['menu'];
        // this.table = bill['table'];
        this.billing = bill['billing'];
        this.instruction = bill['instruction'];
        this.appliedCharges = bill['appliedCharges'];
        this.user = bill['user'];
        this.nonChargeableDetail = bill['nonChargeableDetail'];
        this.billingMode = bill['billingMode'];
        this.settlement = bill['settlement'];
        this.cancelledReason = bill['cancelledReason'];
        // update kots and products
        // first find a kot that matches the id then check for products that match the id and update the quantity and stage
        this.kots.forEach((kot) => {
          let index = bill['kots'].findIndex(
            (item: KotConstructor) => item.id === kot.id,
          );
          if (index !== -1) {
            kot.stage = bill['kots'][index]['stage'];
            kot.products.forEach((product) => {
              let productIndex = bill['kots'][index]['products'].findIndex(
                (item: Product) => item.id === product.id,
              );
              if (productIndex !== -1) {
                product.quantity =
                  bill['kots'][index]['products'][productIndex]['quantity'];
              }
            });
            kot.createdDate = bill['kots'][index]['createdDate'];
            kot.editMode = bill['kots'][index]['editMode'];
          } else {
            // remove kot
            this.kots = this.kots.filter(
              (item) =>
                item.id !== kot.id ||
                kot.stage == 'active' ||
                kot.stage == 'edit',
            );
          }
          this.kots.sort((a, b) => {
            return a.createdDate.seconds - b.createdDate.seconds;
          });
        });
        // add new kots
        bill['kots'].forEach((kot: KotConstructor) => {
          let index = this.kots.findIndex((item) => item.id === kot.id);
          if (index === -1) {
            this.kots.push(new Kot(kot.products[0], this, kot));
          }
        });
        // this.billUpdated.next();
        this.calculateBill(true);
        if (this.stage == 'settled' || this.stage == 'cancelled') {
          this.table.clearTable();
        }
      }
    });
  }
}
export function getKotsObject(this: Bill) {
  // return this.kots.map((kot) => {
  //   return kot.toObject();
  // });
}

export function toObject(this: Bill) {
  // return {
  //   'id': this.id,
  // }
  return {
    id: this.id,
    tokens: this.tokens,
    createdDate: this.createdDate,
    table: this.table.id,
    billNo: this.billNo || null,
    orderNo: this.orderNo || null,
    menu: this.menu,
    mode: this.mode,
    billReprints: this.billReprints,
    optionalTax: this.optionalTax,
    kots: this.kotWithoutFunctions,
    billing: this.billing,
    stage: this.stage,
    user: this.user,
    instruction: this.instruction || null,
    settlement: this.settlement || null,
    cancelledReason: this.cancelledReason || null,
    appliedCharges:this.appliedCharges,
    printableBillData:this.printableBillData || null,
    billingMode: this.billingMode,
    nonChargeableDetail: this.nonChargeableDetail || null,
    customerInfo: {
      name: this.customerInfo.name || null,
      phone: this.customerInfo.phone || null,
      address: this.customerInfo.address || null,
      gst: this.customerInfo.gst || null,
      deliveryName: this.customerInfo.deliveryName || null,
      deliveryPhone: this.customerInfo.deliveryPhone || null,
      loyaltyPoints: this.customerInfo.loyaltyPoints || null,
      averageBillValue: this.customerInfo.averageBillValue || null,
      totalSales: this.customerInfo.totalSales || null,
      totalBills: this.customerInfo.totalBills || null,
      lastBillDate: this.customerInfo.lastBillDate || null,
      lastBillAmount: this.customerInfo.lastBillAmount || null,
      lastBillId: this.customerInfo.lastBillId || null,
    },
    currentLoyalty: this.currentLoyalty,
  };
}

export function fromObject(
  object: BillConstructor,
  table: Table,
  dataprovider: DataProvider,
  analyticsService: AnalyticsService,
  billService: BillService,
  printService: PrinterService,
  customerService: CustomerService,
  userManagementService: UserManagementService,
): Bill {
  if (dataprovider.currentMenu?.selectedMenu) {
    let instance = new Bill(
      object.id,
      table,
      object.mode,
      object.user,
      dataprovider.currentMenu?.selectedMenu,
      dataprovider,
      analyticsService,
      billService,
      printService,
      customerService,
      userManagementService,
    );
    instance.tokens = object.tokens;
    instance.createdDate = object.createdDate;
    instance.billing = object.billing;
    instance.stage = object.stage;
    instance.orderNo = object.orderNo;
    instance.settlement = object.settlement;
    instance.cancelledReason = object.cancelledReason;
    instance.billingMode = object.billingMode;
    instance.nonChargeableDetail = object.nonChargeableDetail;
    instance.customerInfo = object.customerInfo;
    instance.optionalTax = object.optionalTax || false;
    instance.billReprints = object.billReprints || [];
    instance.instruction = object.instruction || '';
    instance.currentLoyalty = object.currentLoyalty || {
      loyaltySettingId: '',
      totalLoyaltyCost: 0,
      totalLoyaltyPoints: 0,
      totalToBeRedeemedPoints: 0,
      totalToBeRedeemedCost: 0,
      receiveLoyalty: false,
      redeemLoyalty: false,
    };
    instance.appliedCharges = object.appliedCharges || {
      containerCharge:0,
      deliveryCharge:0,
      serviceCharge:0,
      tip:0
    };
    // create kots classes from objects and add them to the bill
    object.kots.forEach((kot) => {
      //  console.log('Creating kot', kot);
      instance.addKot(new Kot(kot.products[0], this, kot));
    });
    // instance.currentKot = instance.kots.find((kot) => {
    //   return kot.stage === 'active';
    // }) || null;
    instance.calculateBill(true);
    return instance;
  } else {
    throw new Error('No menu selected');
  }
}

export async function updateToFirebase(this: Bill, data: boolean | void) {
  if (!data) {
    let data = this.toObject();
    // console.log('updating bill', data);
    await this.billService.updateBill(data);
    // console.log('Bill updated', data);
    this.table.updated.next();
  }
  if (!this.billSubscriptionCallerStarted) {
    this.firebaseUpdate();
  }
}
