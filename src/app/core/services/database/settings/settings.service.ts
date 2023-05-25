import { Injectable } from '@angular/core';
import { Firestore, addDoc, arrayUnion, collection, collectionData, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { CodeBaseDiscount } from '../../../../types/discount.structure';
import { BusinessRecord, Member } from '../../../../types/user.structure';
import { OptionalBusinessRecord } from '../../../../types/business.structure';
import { Tax } from '../../../../types/tax.structure';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private firestore:Firestore,private dataProvider:DataProvider) { }
  setSettings(data: any, type: string, productList: string[]) {
    return setDoc(
      doc(
        this.firestore,
        '/business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/recommendedCategories/' + type
      ),
      { settings: data, products: productList },
      { merge: true }
    );
  }

  updateMode(modes:boolean[]){
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings'),
      { modes: modes },
      { merge: true }
    );
  }

  addDiscount(discount:CodeBaseDiscount){
    return addDoc(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/discounts/'),
      {...discount,creationDate:serverTimestamp()}
    );
  }

  updateDiscount(discount:CodeBaseDiscount){
    console.log('business',this.dataProvider.businessId,'discounts',discount.id);
    return setDoc(
      doc(this.firestore, 'business',this.dataProvider.businessId,'discounts',discount.id),
      discount,
      { merge: true }
    );
  }

  deleteDiscount(id:string){
    return deleteDoc(doc(this.firestore, 'business/'+this.dataProvider.businessId+'/discounts/',id));
  }

  getDiscounts(){
    return getDocs(collection(this.firestore, 'business/'+this.dataProvider.businessId+'/discounts/'));
  }

  addBusiness(userBusiness:BusinessRecord,id:string){
    return setDoc(doc(this.firestore,'business',id),{...userBusiness,id});
  }

  addAccount(userAccount:Member,businessId:string){
    return setDoc(doc(this.firestore,'business/'+businessId),{
      users:arrayUnion(userAccount)
    },{merge:true});
  }

  updateBusiness(business:OptionalBusinessRecord){
    return setDoc(doc(this.firestore,'business',this.dataProvider.businessId),business,{merge:true});
  }

  addPaymentMethod(data:any){
    return addDoc(collection(this.firestore,'business/'+this.dataProvider.businessId+'/paymentMethods'),data);
  }

  getPaymentMethods(){
    return getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/paymentMethods'));
  }

  deletePaymentMethod(id:string){
    return deleteDoc(doc(this.firestore,'business/'+this.dataProvider.businessId+'/paymentMethods',id));
  }

  updatePaymentMethod(id:string,data:any){
    return setDoc(doc(this.firestore,'business/'+this.dataProvider.businessId+'/paymentMethods',id),data,{merge:true});
  }

  getTaxesSubscription(){
    return collectionData(collection(this.firestore,'business/'+this.dataProvider.businessId+'/taxes'),{idField:'id'});
  }

  getTaxes(){
    return getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/taxes'));
  }

  addTax(data:Tax){
    return addDoc(collection(this.firestore,'business/'+this.dataProvider.businessId+'/taxes'),data);
  }

  updateTax(id:string,data:any){
    return setDoc(doc(this.firestore,'business/'+this.dataProvider.businessId+'/taxes',id),data,{merge:true});
  }

  deleteTax(id:string){
    return deleteDoc(doc(this.firestore,'business/'+this.dataProvider.businessId+'/taxes',id));
  }
}
