import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-takeaway-bills',
  templateUrl: './takeaway-bills.component.html',
  styleUrls: ['./takeaway-bills.component.scss']
})
export class TakeawayBillsComponent {
  
  reportChangedSubscription:Subscription = Subscription.EMPTY;
  bills:ReplaySubject<BillConstructor[]> = new ReplaySubject<BillConstructor[]>();
  loading:boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService:ReportService){}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(()=>{
      this.loading = true;
      this.reportService.getBills(new Date(),new Date()).then((bills)=>{
        bills = bills.filter((bill)=>bill.mode == 'takeaway');
        console.log("Bills ",bills);
        this.bills.next(bills);
        this.loading = false;
      });
    })
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}
