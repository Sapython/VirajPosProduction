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
  runTransaction,
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
import { PaymentMethod } from '../../../../types/payment.structure';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class BillService {
  updateHistory: any[] = [];
  recalculateBill:Subject<void> = new Subject<void>();
  getOrderAndKotNumberFunction = httpsCallable(this.functions,'getOrderAndKotNumber');
  getKotTokenNumberFunction = httpsCallable(this.functions,'getKotTokenNumber');
  getOrderNumberFunction = httpsCallable(this.functions,'getOrderNumber');
  getOrderKotTakeawayTokenNumberFunction = httpsCallable(this.functions,'getOrderKotTakeawayTokenNumber');
  getOrderKotOnlineTokenNumberFunction = httpsCallable(this.functions,'getOrderKotOnlineTokenNumber');
  getPaymentMethodBillNumberFunction = httpsCallable(this.functions,'getPaymentMethodBillNumber');
  getNcBillNumberFunction = httpsCallable(this.functions,'getNcBillNumber');
  getNormalBillNumberFunction = httpsCallable(this.functions,'getNormalBillNumber');
  constructor(
    private firestore: Firestore,
    private functions:Functions,
    private dataProvider: DataProvider,
    public analyticsService: AnalyticsService,
    private snackbar: MatSnackBar
  ) {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // setTimeout(async () => {
    //   let res = await getDocs(collection(this.firestore,'business',this.dataProvider.currentBusiness.businessId,'bills'))
    //   console.log("TOTAL BILLS BITCH:",res.docs.length);
      
    // }, 20000);
    // setTimeout(()=>{
    //   this.getBillsByDay(yesterday).then((bills) => {
    //     bills.docs.forEach((bill) => {
    //       // console.log('YESTERDAY BILLS', bill);
    //       if (bill.data()['mode'] == 'takeaway' && bill.data()['stage']=='finalized'){
    //         console.log("Deleting table",bill.data()['table']);
    //         console.log("Deleting bill",bill.id);
    //         this.deleteBill(bill.id);
    //         deleteDoc(doc(
    //           this.firestore,
    //           'business/' + this.dataProvider.businessId + '/tokens',
    //           bill.data()['table'],
    //         ));
    //       }
    //     });
    //   });
    // },15000);
    
    // this.dataProvider.menuLoadSubject.subscribe((menu)=>{
    //   let res = this.watchToken().subscribe((tokens)=>{
    //     let filtered = tokens.filter((token)=>token.doc.id=='18')
    //     if(filtered){
    //       console.log("CHANGED TOKEN",tokens,filtered.map((token)=>{return{...token.doc.data(),...token}}));
    //     }
    //   })
    // })
    
    // for(let i =0; i<100;i++){
    //   console.log("FETCHING REQUEST");
    //   fetch("http://43.231.127.94/getOrderKotTakeawayTokenNumber?businessId="+this.dataProvider.currentBusiness.businessId+"", requestOptions)
    //     .then(response => response.text())
    //     .then(result => console.log("FETCHING REQUEST",result))
    //     .catch(error => console.log('FETCHING REQUEST error', error));
    // }
  }

  requestHandler(url:string,method:string,body:any){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify(body);
    var requestOptions:any = {
      method: method ? method : 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    console.log("FETCHING REQUEST",url);
    // return a promise resolved till json
    return fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log("FETCHING REQUEST",result);
        return result.data;
      })
      .catch(error => {
        console.log('FETCHING REQUEST error', error);
      });
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

  updatePaymentMethod(method:PaymentMethod){
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/paymentMethods',
        method.id,
      ),
      method,
      { merge: true },
    );
  }


  getKotTokenNumber(){
    return this.requestHandler("http://43.231.127.94/getKotTokenNumber?businessId="+this.dataProvider.currentBusiness.businessId+"",'POST',{});
    // return this.getKotTokenNumberFunction({businessId:this.dataProvider.businessId});
    // return runTransaction(this.firestore,async (transaction)=>{
    //   let kotTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['kitchenTokenNo'];
    //   transaction.update(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'),{kitchenTokenNo:increment(1)});
    //   return kotTokenNumber;
    // });
  }

  getOrderNumber(){
    return this.requestHandler("http://43.231.127.94/getOrderNumber?businessId="+this.dataProvider.currentBusiness.businessId+"",'POST',{});
    // return this.getOrderNumberFunction({businessId:this.dataProvider.businessId});
    // return runTransaction(this.firestore,async (transaction)=>{
    //   let kotTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['orderTokenNo'];
    //   transaction.update(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'),{orderTokenNo:increment(1)});
    //   return kotTokenNumber;
    // });
  }

  async getOrderAndKotNumber(){
    return this.requestHandler("http://43.231.127.94/getOrderAndKotNumber?businessId="+this.dataProvider.currentBusiness.businessId+"",'POST',{});
    // return runTransaction(this.firestore,async (transaction)=>{
    //   let kotTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['kitchenTokenNo'];
    //   let orderTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['orderTokenNo'];
    //   transaction.update(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'),{kitchenTokenNo:increment(1),orderTokenNo:increment(1)});
    //   return {kotTokenNumber,orderTokenNumber};
    // });
  }

  getOrderKotTakeawayTokenNumber(){
    return this.requestHandler("http://43.231.127.94/getOrderKotTakeawayTokenNumber?businessId="+this.dataProvider.currentBusiness.businessId+"",'POST',{});
    // return runTransaction(this.firestore,async (transaction)=>{
    //   let kotTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['kitchenTokenNo'];
    //   let orderTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['orderTokenNo'];
    //   let takeawayTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['takeawayTokenNo'];
    //   transaction.update(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'),{kitchenTokenNo:increment(1),orderTokenNo:increment(1), takeawayTokenNo:increment(1)});
    //   return {kotTokenNumber,orderTokenNumber,takeawayTokenNumber};
    // });
  }

  getOrderKotOnlineTokenNumber(){
    return this.requestHandler("http://43.231.127.94/getOrderKotOnlineTokenNumber?businessId="+this.dataProvider.currentBusiness.businessId+"",'POST',{});
    // return this.getOrderKotOnlineTokenNumberFunction({businessId:this.dataProvider.businessId});
    // return runTransaction(this.firestore,async (transaction)=>{
    //   let kotTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['kitchenTokenNo'];
    //   let orderTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['orderTokenNo'];
    //   let onlineTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['onlineTokenNo'];
    //   transaction.update(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'),{kitchenTokenNo:increment(1),orderTokenNo:increment(1), onlineTokenNo:increment(1)});
    //   return {kotTokenNumber,orderTokenNumber,onlineTokenNumber};
    // });
  }

  getPaymentMethodBillNumber(paymentMethodId:string,mode:'dineIn'|'takeaway'|'online'){
    return this.requestHandler("http://43.231.127.94/getPaymentMethodBillNumber?businessId="+this.dataProvider.currentBusiness.businessId+"&paymentMethodId="+paymentMethodId+"&mode="+mode,'POST',{});
    // return this.getPaymentMethodBillNumberFunction({businessId:this.dataProvider.businessId,paymentMethodId:paymentMethodId,mode});
    // return runTransaction(this.firestore,async (transaction)=>{
    //   let paymentMethod = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/paymentMethods/'+paymentMethodId))).data();
    //   transaction.update(doc(this.firestore,'business/'+this.dataProvider.businessId+'/paymentMethods/'+paymentMethodId),{billNo:increment(1)});
    //   return (paymentMethod.shortCode ? paymentMethod.shortCode+':' : '') + paymentMethod.billNo;
    // });
  }

  getNcBillNumber(){
    return this.requestHandler("http://43.231.127.94/getNcBillNumber?businessId="+this.dataProvider.currentBusiness.businessId+"",'POST',{});
    // return runTransaction(this.firestore,async (transaction)=>{
    //   let kotTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['ncBillNo'];
    //   transaction.update(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'),{ncBillNo:increment(1)});
    //   return kotTokenNumber;
    // });
  }

  getNormalBillNumber(mode:'dineIn'|'takeaway'|'online'){
    return this.requestHandler("http://43.231.127.94/getNormalBillNumber?businessId="+this.dataProvider.currentBusiness.businessId+"&mode="+mode,'POST',{});
    // return runTransaction(this.firestore,async (transaction)=>{
    //   let kotTokenNumber = (await transaction.get(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'))).data()['ncBillNo'];
    //   transaction.update(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'),{ncBillNo:increment(1)});
    //   return kotTokenNumber;
    // });
  }
  presentToast(
    message: string,
    type: 'info' | 'error' = 'info',
    duration: number = 5000,
    action: string = '',
    sound: boolean = true,
  ) {
    this.snackbar.open(message, action, { duration: duration });
  }

}
