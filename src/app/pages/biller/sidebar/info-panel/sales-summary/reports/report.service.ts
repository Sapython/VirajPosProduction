import { Injectable } from '@angular/core';
import { BillService } from '../../../../../../core/services/database/bill/bill.service';
import { BillConstructor } from '../../../../../../types/bill.structure';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  // bills: ActivityBillConstructor[] = [];

  loading: boolean = false;
  cachedData: CachedData[] = [];

  dateRangeFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  });
  dataChanged: ReplaySubject<void> = new ReplaySubject<void>(1);
  constructor(private billService: BillService) {
    this.dateRangeFormGroup.valueChanges.subscribe(async (value) => {
      if (this.dateRangeFormGroup.valid){
        this.dataChanged.next();
      }
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
        let activities = await this.billService.getActivity(bill.id);
        billData.activities = activities.docs.map((activity) => {
          return activity.data();
        });
        return billData;
      })
    );
    this.cachedData.push({
      startDate: startDate,
      endDate: endDate,
      bills: newBills,
    });
    console.log("CACHED BILLS",this.cachedData);
    this.loading = false;
    return newBills;
  }
}

interface ActivityBillConstructor extends BillConstructor {
  activities: any[];
}

interface CachedData {
  startDate:Date;
  endDate:Date;
  bills:ActivityBillConstructor[];
}