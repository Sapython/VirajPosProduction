import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';
import { Timestamp } from '@angular/fire/firestore';
import { BillActivity } from '../../../../../../../../types/activity.structure';

@Component({
  selector: 'app-bill-edits',
  templateUrl: './bill-edits.component.html',
  styleUrls: ['./bill-edits.component.scss']
})
export class BillEditsComponent {
 
  reportChangedSubscription:Subscription = Subscription.EMPTY;
  bills:ReplaySubject<BillEdit[]> = new ReplaySubject<BillEdit[]>();
  loading:boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService:ReportService){}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(()=>{
      this.loading = true;
      this.reportService.getBills(this.reportService.dateRangeFormGroup.value.startDate,this.reportService.dateRangeFormGroup.value.endDate).then((bills)=>{
        console.log("Bills ",bills);
        let billEdits:BillEdit[] = []
        bills.forEach((bill)=>{
          // go into every activity of every bill and filter out every activity that is of type billReactivated
          bill.activities = bill.activities.filter((activity:{activity:BillActivity,createdDate:Timestamp})=>activity.activity.type == 'billReactivated');
          bill.activities.forEach((activity:{activity:BillActivity,createdDate:Timestamp})=>{
            billEdits.push({
              bill:bill,
              reason:activity.activity.data.reason,
              message:activity.activity.message,
              time:activity.createdDate,
              user:activity.activity.user
            })
          })
        });
        this.bills.next(billEdits);
        this.loading = false;
      });
    })
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}

interface BillEdit {
  bill:BillConstructor;
  reason:string;
  user:string;
  time:Timestamp;
  message:string;
}