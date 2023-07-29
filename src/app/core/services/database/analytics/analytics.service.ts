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
import { DirectFlatDiscount, DirectPercentDiscount, CodeBaseDiscount } from '../../../../types/discount.structure';
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
    private analytics:Analytics
  ) {}

  async addSales(sale: number, type: string) {
    // alert("Adding sales")
    // get date in format of 2021-08-01
    let date = new Date().toISOString().split('T')[0];
    logEvent(this.analytics,'add_sales',{date,sale,type})
    return await setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/sales/' + date
      ),
      {
        [type]: increment(sale),
      },{merge:true}
    );
  }

  addBillToken() {
    alert("Adding bill token");
    logEvent(this.analytics,'add_bill_token',{billTokenNo:this.dataProvider.billToken})
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { billTokenNo: this.dataProvider.billToken }
    );
  }

  addOrderToken() {
    logEvent(this.analytics,'add_order_token',{orderTokenNo:this.dataProvider.orderTokenNo})
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { orderTokenNo: this.dataProvider.orderTokenNo }
    );
  }

  addNcBillToken() {
    logEvent(this.analytics,'add_nc_bill_token',{ncBillTokenNo:this.dataProvider.ncBillToken})
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { ncBillTokenNo: this.dataProvider.ncBillToken }
    );
  }

  addTakeawayToken() {
    // alert("Adding takeaway token");
    logEvent(this.analytics,'add_takeaway_token',{takeawayTokenNo:this.dataProvider.takeawayToken})
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { takeawayTokenNo: this.dataProvider.takeawayToken }
    );
  }

  addOnlineToken() {
    logEvent(this.analytics,'add_online_token',{onlineTokenNo:this.dataProvider.onlineTokenNo})
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { onlineTokenNo: this.dataProvider.onlineTokenNo }
    );
  }

  addKitchenToken() {
    logEvent(this.analytics,'add_kitchen_token',{kitchenTokenNo:this.dataProvider.kotToken})
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { kitchenTokenNo: this.dataProvider.kotToken }
    );
  }

  logKot(kot:Kot,type:'new'|'cancelled'|'edited'|'reprint'){
    logEvent(this.analytics,type+'_kot',kot.toObject())
  }

  logBill(bill:Bill){
    logEvent(this.analytics,'bill',bill.toObject())
  }

  logDiscount(discount:DirectFlatDiscount|DirectPercentDiscount|CodeBaseDiscount,bill:Bill){
    logEvent(this.analytics,'discount',discount)
  }

  splitBill(bills:Bill[]){
    logEvent(this.analytics,'splitBill',bills.map((bill)=>bill.toObject()))
  }

  newTable(table:Table,type:'dine'|'takeaway'|'online'){
    logEvent(this.analytics,type+'_table',table.toObject())
  }
}
