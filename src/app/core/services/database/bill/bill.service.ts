import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, getDoc, getDocs, increment, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { Product } from '../../../../types/product.structure';

@Injectable({
  providedIn: 'root'
})
export class BillService {

  constructor(private firestore:Firestore,private dataProvider:DataProvider) { }

  updateBill(bill: any) {
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/bills', bill.id),
      bill,
      { merge: true }
    );
  }

  getBill(id: string) {
    console.log('business/'+this.dataProvider.businessId+'/bills', id);
    return getDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/bills', id)
    );
  }

  getBillSubscription(id: string) {
    console.log('business/'+this.dataProvider.businessId+'/bills', id);
    return docData(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/bills', id)
    );
  }

  getBills() {
    return getDocs(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/bills')
    );
  }

  getBillsByDay(date: Date,endDate?:Date) {
    let minTime = new Date(date);
    minTime.setHours(0, 0, 0, 0);
    if (endDate){
      var maxTime = new Date(endDate);
      maxTime.setHours(23, 59, 59, 999);
    } else {
      var maxTime = new Date(date);
      maxTime.setHours(23, 59, 59, 999);
    }
    return getDocs(
      query(
        collection(this.firestore, 'business/'+this.dataProvider.businessId+'/bills'),
        where('createdDate', '>=', minTime),
        where('createdDate', '<=', maxTime)
      )
    );
  }

  updateProducts(products: Product[]) {
    return Promise.all(
      products.map((product) => {
        return setDoc(
          doc(
            this.firestore,
            'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/products/' + product.id
          ),
          { ...product, quantity: 1 },
          { merge: true }
        );
      })
    );
  }


  updateOnlineToken(token: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/onlineTokens',
        token.id
      ),
      token,
      { merge: true }
    );
  }

  getBillsSubscription() {
    return collectionData(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/bills'),
      { idField: 'id' }
    );
  }

  updateToken(token: any) {
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/tokens', token.id),
      token,
      { merge: true }
    );
  }


}
