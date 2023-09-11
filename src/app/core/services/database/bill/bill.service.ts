import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionChanges,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { Product } from '../../../../types/product.structure';
import { BillConstructor } from '../../../../types/bill.structure';
import { AnalyticsService } from '../analytics/analytics.service';
import { Bill } from '../../../constructors/bill';
import { BillActivity } from '../../../../types/activity.structure';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BillService {
  updateHistory: any[] = [];
  recalculateBill:Subject<void> = new Subject<void>();
  constructor(
    private firestore: Firestore,
    private dataProvider: DataProvider,
    public analyticsService: AnalyticsService,
  ) {
    // this.dataProvider.menuLoadSubject.subscribe((menu)=>{
    //   let res = this.watchToken().subscribe((tokens)=>{
    //     let filtered = tokens.filter((token)=>token.doc.id=='18')
    //     if(filtered){
    //       console.log("CHANGED TOKEN",tokens,filtered.map((token)=>{return{...token.doc.data(),...token}}));
    //     }
    //   })
    // })
  }

  deleteBill(billId:string){
    return deleteDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/bills',
        billId,
      ),
    );
  }

  updateBill(bill: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/bills',
        bill.id,
      ),
      bill,
      { merge: true },
    );
  }

  getBill(id: string) {
    if (!this.dataProvider.businessId) {
      console.log(
        'NO BUSINESS ID:  ',
        'business/' + this.dataProvider.businessId + '/bills',
        id,
      );
      alert('NO BUSINESS ID');
      return;
    }
    //  console.log('business/'+this.dataProvider.businessId+'/bills', id);
    return getDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/bills',
        id,
      ),
    );
  }

  getBillSubscription(id: string) {
    //  console.log('business/'+this.dataProvider.businessId+'/bills', id);
    return docData(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/bills',
        id,
      ),
    );
  }

  getBills() {
    return getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/bills',
      ),
    );
  }

  getBillsByDay(date: Date, endDate?: Date) {
    let minTime = new Date(date);
    minTime.setHours(0, 0, 0, 0);
    if (endDate) {
      var maxTime = new Date(endDate);
      maxTime.setHours(23, 59, 59, 999);
    } else {
      var maxTime = new Date(date);
      maxTime.setHours(23, 59, 59, 999);
    }
    return getDocs(
      query(
        collection(
          this.firestore,
          'business/' + this.dataProvider.businessId + '/bills',
        ),
        where('createdDate', '>=', minTime),
        where('createdDate', '<=', maxTime),
      ),
    );
  }

  getActivity(billId: string) {
    return getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/bills/' +
          billId +
          '/billActivities',
      ),
    );
  }

  updateProducts(products: Product[]) {
    return Promise.all(
      products.map((product) => {
        return setDoc(
          doc(
            this.firestore,
            'business/' +
              this.dataProvider.businessId +
              '/menus/' +
              this.dataProvider.currentMenu?.selectedMenu?.id +
              '/products/' +
              product.id,
          ),
          { ...product, quantity: 1 },
          { merge: true },
        );
      }),
    );
  }

  addSales(productSales: {item:string,sales:number}[]) {
    return Promise.all(
      productSales.map((id) => {
        return updateDoc(
          doc(
            this.firestore,
            'business/' +
              this.dataProvider.businessId +
              '/menus/' +
              this.dataProvider.currentMenu?.selectedMenu?.id +
              '/products/' +
              id.item,
          ),
          { sales: increment(id.sales) },
        );
      }),
    );
  }

  updateOnlineToken(token: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/onlineTokens',
        token.id,
      ),
      token,
      { merge: true },
    );
  }

  getBillsSubscription() {
    return collectionData(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/bills',
      ),
      { idField: 'id' },
    );
  }

  watchToken() {
    return collectionChanges(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tokens',
      ),
    );
  }

  updateToken(token: any) {
    // let foundTokens = this.updateHistory.filter((token)=>token.id==token.id)
    // if(foundTokens.length>0){
    //   if (!token.bill){
    //     // check if token had any bill before
    //     let hasTokens = foundTokens.filter((token)=>token.bill);
    //     if(hasTokens.length >0){
    //       alert("Token already had a bill")
    //       // console.log("HAD TOKENS",hasTokens);
    //       return
    //     }
    //   }
    // }
    // this.updateHistory.push(token)
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tokens',
        token.id,
      ),
      token,
      { merge: true },
    );
  }

  saveSplittedBill(billNo, bill: BillConstructor) {
    return addDoc(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/bills',
        billNo,
        'splittedBills',
      ),
      bill,
    );
  }

  provideAnalytics() {
    return this.analyticsService;
  }

  addActivity(bill: Bill, activity: BillActivity) {
    // console.log('ACTIVITY', activity);
    return addDoc(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/bills/' +
          bill.id +
          '/billActivities',
      ),
      {
        activity: activity,
        createdDate: serverTimestamp(),
        deviceTime: new Date(),
      },
    );
  }

  getAnalyticsReport(date: Date) {
    // fetch this path /business/uqd9dm0its2v9xx6fey2q/analyticsData/2023/7/21
    console.log(
      'Fetching analytics data for ',
      'business/' +
        this.dataProvider.businessId +
        '/analyticsData/' +
        date.getFullYear() +
        '/' +
        (date.getMonth() + 1) +
        '/' +
        date.getDate(),
    );
    return getDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/analyticsData/' +
          date.getFullYear() +
          '/' +
          (date.getMonth() + 1) +
          '/' +
          date.getDate(),
      ),
    );
  }

  getSplittedBill(billId:string,splitBillId:string){
    return getDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/bills',
        billId,
        'splittedBills',
        splitBillId
      ),
    );
  }
}
