import { Injectable } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { CodeBaseDiscount } from '../../../../types/discount.structure';
import { BusinessRecord, Member } from '../../../../types/user.structure';
import { OptionalBusinessRecord } from '../../../../types/business.structure';
import { Tax } from '../../../../types/tax.structure';
import { PaymentMethod } from '../../../../types/payment.structure';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    private firestore: Firestore,
    private dataProvider: DataProvider,
  ) {}
  setSettings(data: any, type: string, productList: string[]) {
    return setDoc(
      doc(
        this.firestore,
        '/business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/recommendedCategories/' +
          type,
      ),
      { settings: data, products: productList },
      { merge: true },
    );
  }

  updateMode(modes: boolean[]) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      { modes: modes },
      { merge: true },
    );
  }

  addDiscount(discount: CodeBaseDiscount) {
    return addDoc(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/discounts/',
      ),
      { ...discount, creationDate: serverTimestamp() },
    );
  }

  updateDiscount(discount: CodeBaseDiscount) {
    //  console.log('business',this.dataProvider.businessId,'discounts',discount.id);
    return setDoc(
      doc(
        this.firestore,
        'business',
        this.dataProvider.businessId,
        'discounts',
        discount.id,
      ),
      discount,
      { merge: true },
    );
  }

  deleteDiscount(id: string) {
    return deleteDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/discounts/',
        id,
      ),
    );
  }

  getDiscounts() {
    return getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/discounts/',
      ),
    );
  }

  addBusiness(userBusiness: BusinessRecord, id: string) {
    return setDoc(doc(this.firestore, 'business', id), { ...userBusiness, id });
  }

  addAccount(userAccount: Member, businessId: string) {
    return setDoc(
      doc(this.firestore, 'business/' + businessId),
      {
        users: arrayUnion(userAccount),
      },
      { merge: true },
    );
  }

  updateBusiness(business: OptionalBusinessRecord) {
    return setDoc(
      doc(this.firestore, 'business', this.dataProvider.businessId),
      business,
      { merge: true },
    );
  }

  addPaymentMethod(data: any) {
    return addDoc(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/paymentMethods',
      ),
      data,
    );
  }

  getPaymentMethods() {
    return getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/paymentMethods',
      ),
    );
  }

  deletePaymentMethod(id: string) {
    return deleteDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/paymentMethods',
        id,
      ),
    );
  }

  updatePaymentMethod(id: string, data: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/paymentMethods',
        id,
      ),
      data,
      { merge: true },
    );
  }

  getTaxesSubscription() {
    return collectionData(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/taxes',
      ),
      { idField: 'id' },
    );
  }

  getTaxes() {
    return getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/taxes',
      ),
    );
  }

  addTax(data: Tax) {
    return addDoc(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/taxes',
      ),
      data,
    );
  }

  updateTax(id: string, data: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/taxes',
        id,
      ),
      data,
      { merge: true },
    );
  }

  deleteTax(id: string) {
    return deleteDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/taxes',
        id,
      ),
    );
  }

  async updateUserBusiness(userId:string,data:any) {
    let userData = await getDoc(doc(this.firestore,'users',userId))
    if(userData.exists()) {
      let user = userData.data() as any;
      user.business = user.business.map((business:any) => {
        if (business.businessId == data.businessId){
          let newData = {
            ...business,
            ...data
          }
          console.log("Updating business",newData);
          return newData;
        } else {
          return business;
        }
      });
      console.log("Updating user",user);
      return updateDoc(doc(this.firestore,'users',userId),user);
    }
  }

  async deleteAllData(){
    this.dataProvider.loading = true;
    // delete all bills
    let bills = await getDocs(collection(this.firestore,'business',this.dataProvider.businessId,'bills'));
    await Promise.all(bills.docs.map(async(bill) => {
      await deleteDoc(doc(this.firestore,'business',this.dataProvider.businessId,'bills',bill.id));
    }));
    // delete all tokens
    let tokens = await getDocs(collection(this.firestore,'business',this.dataProvider.businessId,'tokens'));
    await Promise.all(tokens.docs.map(async (token) => {
      await deleteDoc(doc(this.firestore,'business',this.dataProvider.businessId,'tokens',token.id));
    }));
    // delete all online tokens
    let onlineTokens = await getDocs(collection(this.firestore,'business',this.dataProvider.businessId,'onlineTokens'));
    await Promise.all(onlineTokens.docs.map(async (token) => {
      await deleteDoc(doc(this.firestore,'business',this.dataProvider.businessId,'onlineTokens',token.id));
    }));
    // delete all analyticsData
    let analyticsData = await getDocs(collection(this.firestore,'business',this.dataProvider.businessId,'analyticsData'));
    await Promise.all(analyticsData.docs.map(async (token) => {
      await deleteDoc(doc(this.firestore,'business',this.dataProvider.businessId,'analyticsData',token.id));
    }));
    // delete all salesCounters
    let sales = await getDocs(collection(this.firestore,'business',this.dataProvider.businessId,'sales'));
    await Promise.all(sales.docs.map(async (token) => {
      await deleteDoc(doc(this.firestore,'business',this.dataProvider.businessId,'sales',token.id));
    }));
    // delete all tokenCounters
    let dailyTokens = await getDocs(collection(this.firestore,'business',this.dataProvider.businessId,'dailyTokens'));
    await Promise.all(dailyTokens.docs.map(async (token) => {
      await deleteDoc(doc(this.firestore,'business',this.dataProvider.businessId,'dailyTokens',token.id));
    }));
    // reset settings
    await updateDoc(doc(this.firestore,'business',this.dataProvider.businessId,'settings','settings'),{
      billTokenNo:1,
      dineInSales:0,
      kitchenTokenNo:1,
      ncBillToken:1,
      nonChargeableSales:0,
      onlineSales:0,
      onlineTokenNo:0,
      orderTokenNo:1,
      takeawaySales:0,
      takeawayTokenNo:0,
    });
    // reset all payment method bill counters
    let paymentMethods = await getDocs(collection(this.firestore,'business',this.dataProvider.businessId,'paymentMethods'));
    await Promise.all(paymentMethods.docs.map(async (paymentMethod) => {
      await updateDoc(doc(this.firestore,'business',this.dataProvider.businessId,'paymentMethods',paymentMethod.id),{
        billNo:1
      });
    }));
    this.dataProvider.loading = false;
    let url = window.location.href.split('/');
    url.pop();
    url.push('index.html');
    window.location.href = url.join('/');
  }

  addDefaultPaymentMethods(){
    let paymentMethods:PaymentMethod[] = [
      {
        addDate: Timestamp.fromDate(new Date()),
        detail:false,
        name:'Cash',
        updateDate: Timestamp.fromDate(new Date()),
        billNo:1
      },
      {
        addDate: Timestamp.fromDate(new Date()),
        detail:false,
        name:'Card',
        updateDate: Timestamp.fromDate(new Date()),
        billNo:1
      },
      {
        addDate: Timestamp.fromDate(new Date()),
        detail:false,
        name:'UPI',
        updateDate: Timestamp.fromDate(new Date()),
        billNo:1
      },
    ];
    return Promise.all(paymentMethods.map(async (paymentMethod) => {
      await addDoc(collection(this.firestore,'business',this.dataProvider.businessId,'paymentMethods'),paymentMethod);
    }));
  }
}
