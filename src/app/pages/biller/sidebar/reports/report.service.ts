import { Injectable } from '@angular/core';
import { BillService } from '../../../../core/services/database/bill/bill.service';
import { BillConstructor } from '../../../../types/bill.structure';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  // bills: ActivityBillConstructor[] = [];
  noData: boolean = false;
  loading: boolean = false;
  cachedData: CachedData[] = [];
  cachedTables:{[key:string]:any} = {};
  consolidatedMaxAmount: number = 0;
  downloadPdf: Subject<void> = new Subject<void>();
  downloadExcel: Subject<void> = new Subject<void>();

  dateRangeFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  });
  dataChanged: ReplaySubject<void> = new ReplaySubject<void>(1);
  refetchConsolidated:Subject<void> = new Subject<void>();
  constructor(
    private billService: BillService,
    private firestore: Firestore,
    private dataProvider: DataProvider,
  ) {
    this.dateRangeFormGroup.valueChanges.subscribe(async (value) => {
      if (this.dateRangeFormGroup.valid) {
        this.dataChanged.next();
      }
    });
    this.dateRangeFormGroup.setValue({
      startDate: new Date(),
      endDate: new Date(),
    });
  }

  async getBills(startDate: Date, endDate?: Date) {
    this.loading = true;
    // don't fetch if already cached or even if it is cached, fetch if it is more than 20 minutes old
    if (this.cachedData.length > 0) {
      let cachedData = this.cachedData.find((data) => {
        return (
          // only match day, month and year
          data.startDate.getDate() == startDate.getDate() &&
          data.startDate.getMonth() == startDate.getMonth() &&
          data.startDate.getFullYear() == startDate.getFullYear() &&
          data.endDate.getDate() == endDate.getDate() &&
          data.endDate.getMonth() == endDate.getMonth() &&
          data.endDate.getFullYear() == endDate.getFullYear()
        );
      });
      if (cachedData) {
        let now = new Date();
        let diff = now.getTime() - cachedData.endDate.getTime();
        if (diff < 20 * 60 * 1000) {
          this.loading = false;
          return cachedData.bills;
        }
      }
    }
    let bills = await this.billService.getBillsByDay(startDate, endDate);
    let newBills = await Promise.all(
      bills.docs.map(async (bill) => {
        let billData = bill.data() as ActivityBillConstructor;
        if(bill.data()['mode'] == 'dineIn'){
          let reqs = await Promise.all([await this.billService.getActivity(bill.id),await this.getTable(bill.data()['table'],this.dataProvider.currentBusiness.businessId)]);
          billData.activities = reqs[0].docs.map((activity) => {
            return activity.data();
          });
          billData.table = reqs[1];
        } else {
          let activities = await this.billService.getActivity(bill.id);
          billData.activities = activities.docs.map((activity) => {
            return activity.data();
          });
        }
        return billData;
      }),
    );
    this.cachedData.push({
      startDate: startDate,
      endDate: endDate,
      bills: newBills,
    });
    console.log('CACHED BILLS', this.cachedData);
    this.loading = false;
    if (newBills.length == 0) {
      this.noData = true;
    } else {
      this.noData = false;
    }
    return newBills;
  }

  async getTableActivity() {
    let date: Date = this.dateRangeFormGroup.value.startDate;
    let endDate: Date = this.dateRangeFormGroup.value.endDate;
    let minTime = new Date(date);
    minTime.setHours(0, 0, 0, 0);
    if (endDate) {
      var maxTime = new Date(endDate);
      maxTime.setHours(23, 59, 59, 999);
    } else {
      var maxTime = new Date(date);
      maxTime.setHours(23, 59, 59, 999);
    }
    let docs = await getDocs(
      query(
        collection(
          this.firestore,
          `business/${this.dataProvider.currentBusiness.businessId}/tableActivity`,
        ),
        where('time', '>=', minTime),
        where('time', '<=', maxTime),
      ),
    );
    let activities = docs.docs.map((doc) => {
      return doc.data();
    });
    if (activities.length == 0) {
      this.noData = true;
    } else {
      this.noData = false;
    }
    return activities
  }

  async getSplittedBill(billId:string,splittedBillId:string,businessId:string){
    return await getDoc(doc(this.firestore,'business',businessId,'bills',billId,'splittedBills',splittedBillId));
  }

  getCustomers(startDate:Date,endDate:Date,businessId:string){
    // set hours to 0
    startDate.setHours(0,0,0,0);
    // set hours to 23
    endDate.setHours(23,59,59,999);
    return getDocs(query(collection(this.firestore,'business',businessId,'customers'),
      where('created','>=',startDate),
      where('created','<=',endDate),
    ));
  }

  async getTable(tableId:string,businessId:string){
    // find in cached data 
    if (this.cachedTables[businessId] && this.cachedTables[businessId][tableId]) {
      let table = this.cachedTables[businessId][tableId];
      if (table) {
        return table;
      }
    }
    let table = await getDoc(doc(this.firestore,'business',businessId,'tables',tableId));
    // add to cachedTables
    if(!this.cachedTables[businessId]){
      this.cachedTables[businessId] = {};
    }
    this.cachedTables[businessId][tableId] = table.data();
    return table.data();
  }

}

interface ActivityBillConstructor extends BillConstructor {
  activities: any[];
}

interface CachedData {
  startDate: Date;
  endDate: Date;
  bills: ActivityBillConstructor[];
  tables?:any[];
}
