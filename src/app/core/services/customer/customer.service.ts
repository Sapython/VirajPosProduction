import { Injectable } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { DataProvider } from '../provider/data-provider.service';
import { firstValueFrom } from 'rxjs';
import { Bill } from '../../constructors/bill';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { AlertsAndNotificationsService } from '../alerts-and-notification/alerts-and-notifications.service';
import { CustomerInfo } from '../../../types/user.structure';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  calculateLoyaltyPointsFunction = httpsCallable(
    this.functions,
    'calculateLoyaltyPoints',
  );
  constructor(
    private indexedDbService: NgxIndexedDBService,
    private firestore: Firestore,
    private dataProvider: DataProvider,
    private functions: Functions,
    private alertify: AlertsAndNotificationsService,
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
            if (
              customer['customerDbVersion'] <
              this.dataProvider.customerDatabaseVersion
            ) {
              this.fetchCustomers();
            }
          }
        });
      },
      (error) => {
        console.log('error', error);
      },
    );
    // console.log('Started customer version fetch');
  }

  fetchCustomers() {
    getDocs(
      collection(
        this.firestore,
        'business',
        this.dataProvider.currentBusiness.businessId,
        'customers',
      ),
    )
      .then((customers) => {
        // console.log('customers', customers);
      })
      .catch((error) => {
        // console.log('error', error);
      });
  }

  async addCustomer(customer: CustomerInfo, bill: Bill) {
    let customerData = {
      address: customer.address,
      gst: customer.gst,
      name: customer.name,
      phone: customer.phone,
    };
    console.log('ADDING CUSTOMER', customerData);
    let res = await addDoc(
      collection(
        this.firestore,
        'business',
        this.dataProvider.currentBusiness.businessId,
        'customers',
      ),
      {...customerData,created: serverTimestamp()},
    );
    customerData['id'] = res.id;
    this.dataProvider.customers = [
      ...this.dataProvider.customers,
      customerData,
    ];
    this.dataProvider.customersUpdated.next();
    return res;
  }

  async updateCustomer(customer: CustomerInfo, bill: Bill) {
    let localCustomer = this.dataProvider.customers.find(
      (onlineCustomer) => onlineCustomer.phone == customer.phone,
    );
    if (localCustomer) {
      console.log('Updating CUSTOMER', localCustomer);
      // update local customers
      this.dataProvider.customers = this.dataProvider.customers.map(
        (customer) => {
          if (customer.phone == customer.phone) {
            return {
              ...customer,
              address: customer.address,
              gst: customer.gst,
              name: customer.name,
              phone: customer.phone,
            };
          } else {
            return customer;
          }
        },
      );
      let updatedCustomerDoc = await updateDoc(
        doc(
          this.firestore,
          'business',
          this.dataProvider.currentBusiness.businessId,
          'customers',
          localCustomer.id,
        ),
        {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          gst: customer.gst,
          updated: serverTimestamp(),
        },
      );
      // deduct loyalty points from customer
      await this.deductUsedLoyaltyPoints(localCustomer.id, bill);
      // add loyalty points to customer
      await this.addBillToCustomer(localCustomer.id, bill);
      return updatedCustomerDoc;
    } else {
      let newCustomerDoc = await this.addCustomer(customer, bill);
      await this.addBillToCustomer(newCustomerDoc.id, bill);
    }
  }

  addLoyaltyPoint(bill: Bill) {
    this.calculateLoyaltyPointsFunction({
      billId: bill.id,
      businessId: this.dataProvider.currentBusiness.businessId,
      userId: this.dataProvider.currentUser.username,
    })
      .then((res) => {
        if (res) {
          console.log(res);
        }
      })
      .catch((error) => {
        console.log('error', error);
        this.alertify.presentToast(error.message, 'error');
      });
  }

  addBillToCustomer(customerID: string, bill: Bill) {
    console.log(":::Adding bill under customer.",'business',
    this.dataProvider.currentBusiness.businessId,
    'customers',
    customerID,
    'bills',);
    return addDoc(
      collection(
        this.firestore,
        'business',
        this.dataProvider.currentBusiness.businessId,
        'customers',
        customerID,
        'bills',
      ),
      {
        billId: bill.id,
        loyaltyAvailable: bill.currentLoyalty.receiveLoyalty,
        billRef: doc(
          this.firestore,
          'business',
          this.dataProvider.currentBusiness.businessId,
          'bills',
          bill.id,
        ),
        created: serverTimestamp(),
      },
    );
  }

  deductUsedLoyaltyPoints(customerID: string, bill: Bill) {
    return updateDoc(
      doc(
        this.firestore,
        'business',
        this.dataProvider.currentBusiness.businessId,
        'customers',
        customerID,
      ),
      {
        loyaltyPoints: increment(-bill.currentLoyalty.totalToBeRedeemedPoints),
      },
    );
  }
}
