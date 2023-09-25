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
    // get daily counters
    let newDate = new Date()
    let month =(newDate.getMonth()+1).toString()
    if ((newDate.getMonth()+1) < 10){
      month = '0' + (newDate.getMonth()+1).toString();
    }
    let date = (newDate.getFullYear() + '-' + month + '-' + newDate.getDate());
    console.log("Date ISF: ",date);
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
