import { Injectable } from '@angular/core';
import { Product } from '../../../../types/product.structure';
import {
  Firestore,
  doc,
  increment,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { Analytics, logEvent } from '@angular/fire/analytics';
import {
  DirectFlatDiscount,
  DirectPercentDiscount,
  CodeBaseDiscount,
} from '../../../../types/discount.structure';
import { Bill } from '../../../constructors/bill';
import { Kot } from '../../../constructors/kot/Kot';
import { Table } from '../../../constructors/table/Table';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(
    private firestore: Firestore,
    private dataProvider: DataProvider,
    private analytics: Analytics,
  ) {}

  async addSales(sale: number, type: string,billDate:Date) {
    // alert("Adding sales")
    // get date in format of 2021-08-01
    let date = billDate.toISOString().split('T')[0];
    logEvent(this.analytics, 'add_sales', { date, sale, type });
    return await setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/sales/' + date,
      ),
      {
        [type]: increment(sale),
      },
      { merge: true },
    );
  }

  async addBillToken() {
    let numCopy = structuredClone(this.dataProvider.billToken);
    logEvent(this.analytics, 'add_bill_token', {
      billTokenNo: numCopy,
    });
    let date = new Date().toISOString().split('T')[0];
    await setDoc(doc(this.firestore, 'business/' + this.dataProvider.businessId+'/dailyTokens/'+date), {
      billTokenNo: increment(1),
    },{merge:true});
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      { billTokenNo: numCopy },
    );
  }

  async addOrderToken() {
    let numCopy = structuredClone(this.dataProvider.orderTokenNo);
    logEvent(this.analytics, 'add_order_token', {
      orderTokenNo: numCopy,
    });
    let date = new Date().toISOString().split('T')[0];
    await setDoc(doc(this.firestore, 'business/' + this.dataProvider.businessId+'/dailyTokens/'+date), {
      orderTokenNo: increment(1),
    },{merge:true});
    console.log("Setting order no",numCopy);
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      { orderTokenNo: numCopy },
    );
  }

  async addNcBillToken() {
    let numCopy = structuredClone(this.dataProvider.ncBillToken);
    logEvent(this.analytics, 'add_nc_bill_token', {
      ncBillTokenNo: numCopy,
    });
    let date = new Date().toISOString().split('T')[0];
    await setDoc(doc(this.firestore, 'business/' + this.dataProvider.businessId+'/dailyTokens/'+date), {
      ncBillTokenNo: increment(1),
    },{merge:true});
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      { ncBillTokenNo: numCopy },
    );
  }

  async addTakeawayToken() {
    // alert("Adding takeaway token");
    let numCopy = structuredClone(this.dataProvider.takeawayToken);
    logEvent(this.analytics, 'add_takeaway_token', {
      takeawayTokenNo: numCopy,
    });
    let date = new Date().toISOString().split('T')[0];
    await setDoc(doc(this.firestore, 'business/' + this.dataProvider.businessId+'/dailyTokens/'+date), {
      takeawayTokenNo: increment(1),
    },{merge:true});
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      { takeawayTokenNo: numCopy },
    );
  }

  async addOnlineToken() {
    let numCopy = structuredClone(this.dataProvider.onlineTokenNo);
    logEvent(this.analytics, 'add_online_token', {
      onlineTokenNo: numCopy,
    });
    let date = new Date().toISOString().split('T')[0];
    await setDoc(doc(this.firestore, 'business/' + this.dataProvider.businessId+'/dailyTokens/'+date), {
      onlineTokenNo: increment(1),
    },{merge:true});
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      { onlineTokenNo: numCopy },
    );
  }

  async addKitchenToken() {
    let numCopy = structuredClone(this.dataProvider.kotToken);
    logEvent(this.analytics, 'add_kitchen_token', {
      kitchenTokenNo: numCopy,
    });
    let date = new Date().toISOString().split('T')[0];
    await setDoc(doc(this.firestore, 'business/' + this.dataProvider.businessId+'/dailyTokens/'+date), {
      kitchenTokenNo: increment(1),
    },{merge:true});
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      { kitchenTokenNo: numCopy },
    );
  }

  logKot(kot: Kot, type: 'new' | 'cancelled' | 'edited' | 'reprint') {
    logEvent(this.analytics, type + '_kot', kot.toObject());
  }

  logBill(bill: Bill) {
    logEvent(this.analytics, 'bill', bill.toObject());
  }

  logDiscount(
    discount: DirectFlatDiscount | DirectPercentDiscount | CodeBaseDiscount,
    bill: Bill,
  ) {
    logEvent(this.analytics, 'discount', discount);
  }

  splitBill(bills: Bill[]) {
    logEvent(
      this.analytics,
      'splitBill',
      bills.map((bill) => bill.toObject()),
    );
  }

  newTable(table: Table, type: 'dine' | 'takeaway' | 'online') {
    logEvent(this.analytics, type + '_table', table.toObject());
  }
}
