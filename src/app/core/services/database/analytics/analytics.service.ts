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

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(
    private firestore: Firestore,
    private dataProvider: DataProvider
  ) {}

  async addSales(sale: number, type: string) {
    // alert("Adding sales")
    // get date in format of 2021-08-01
    let date = new Date().toISOString().split('T')[0];
    await setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/sales/' + date
      ),
      {
        [type]: increment(sale),
      }
    );
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      {
        [type]: increment(sale),
      }
    );
  }

  addBillToken() {
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { billTokenNo: this.dataProvider.billToken }
    );
  }

  addOrderToken() {
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { orderTokenNo: this.dataProvider.orderTokenNo }
    );
  }

  addNcBillToken() {
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { ncBillTokenNo: this.dataProvider.ncBillToken }
    );
  }

  addTakeawayToken() {
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { takeawayTokenNo: this.dataProvider.takeawayToken }
    );
  }

  addOnlineToken() {
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { onlineTokenNo: this.dataProvider.onlineTokenNo }
    );
  }

  addKitchenToken() {
  //  console.log('this.dataProvider.kotToken', this.dataProvider.kotToken);
    return updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings'
      ),
      { kitchenTokenNo: this.dataProvider.kotToken }
    );
  }
}
