import { Injectable } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, doc, getDocs, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { DataProvider } from '../provider/data-provider.service';
import { firstValueFrom } from 'rxjs';
import { Customer } from '../../../types/customer.structure';
import { Bill } from '../../constructors/bill';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { AlertsAndNotificationsService } from '../alerts-and-notification/alerts-and-notifications.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  calculateLoyaltyPointsFunction = httpsCallable(this.functions,'calculateLoyaltyPoints')
  constructor(
    private indexedDbService: NgxIndexedDBService,
    private firestore: Firestore,
    private dataProvider:DataProvider,
    private functions:Functions,
    private alertify:AlertsAndNotificationsService
  ) {
    // console.log('Customers');
    this.getCustomers();
  }

  getCustomers() {
    this.indexedDbService.getByKey('config', 'customerDbVersion').subscribe(
      (customer) => {
        // console.log('customer', customer);
        firstValueFrom(this.dataProvider.menuLoadSubject).then((menu) => {
          if (!customer) {
            this.fetchCustomers();
          } else {
            if (customer['customerDbVersion'] < this.dataProvider.customerDatabaseVersion) {
              this.fetchCustomers();
            }
          }
        })
      },
      (error) => {
        console.log('error', error);
      }
    );
    // console.log('Started customer version fetch');
  }

  fetchCustomers() {
    getDocs(collection(this.firestore,'business',this.dataProvider.currentBusiness.businessId,'customers')).then((customers) => {
      // console.log('customers', customers);
    }).catch((error) => {
      // console.log('error', error);
    });
  }

  async addCustomer(customer:{address:string,gst:string,name:string,phone:string},bill:Bill) {
    let customerData = {
      address:customer.address,
      gst:customer.gst,
      name:customer.name,
      phone:customer.phone,
      averageOrderPrice:bill.printableBillData.grandTotal,
      lastMonth:'',
      lastOrder:'',
      lastOrderDate:'',
      lastOrderDish:bill.printableBillData.products.map((product)=>product.name),
      loyaltyPoints:0,
      orderFrequency:0,
      id:'',
      createdDate:Timestamp.now(),
    }
    console.log("ADDING CUSTOMER",customerData);
    let res = await addDoc(collection(this.firestore,'business',this.dataProvider.currentBusiness.businessId,'customers'),customerData)
    customerData['id'] = res.id
    this.dataProvider.customers = [...this.dataProvider.customers,customerData];
    this.dataProvider.customersUpdated.next();
    return res
  }

  updateCustomer(customer:{address:string,gst:string,name:string,phone:string},bill:Bill){
    let id = this.dataProvider.customers.find((customer)=>customer.phone == customer.phone)
    if (id){
      console.log("Updating CUSTOMER",id);
      // update local customers
      this.dataProvider.customers = this.dataProvider.customers.map((customer)=>{
        if (customer.phone == customer.phone){
          return {
            ...customer,
            address:customer.address,
            gst:customer.gst,
            name:customer.name,
            phone:customer.phone,
          }
        } else {
          return customer
        }
      })
      return updateDoc(doc(this.firestore,'business',this.dataProvider.currentBusiness.businessId,'customers',id.id),{
        name:customer.name,
        phone:customer.phone,
        address:customer.address,
        gst:customer.gst,
        updated:serverTimestamp()
      })
    } else {
      return this.addCustomer(customer,bill)
    }
  }

  addLoyaltyPoint(bill:Bill){
    this.calculateLoyaltyPointsFunction({
      billId:bill.id,
      businessId:this.dataProvider.currentBusiness.businessId,
      userId:this.dataProvider.currentUser.username
    }).then((res)=>{
      if(res){
        console.log(res);
      }
    }).catch((error)=>{
      console.log("error",error);
      this.alertify.presentToast(error.message,'error')
    })
  }

}
