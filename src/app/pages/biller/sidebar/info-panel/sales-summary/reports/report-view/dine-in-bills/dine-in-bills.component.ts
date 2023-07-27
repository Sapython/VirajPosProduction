import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-dine-in-bills',
  templateUrl: './dine-in-bills.component.html',
  styleUrls: ['./dine-in-bills.component.scss']
})
export class DineInBillsComponent {
  
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
      this.reportService.getBills(this.reportService.dateRangeFormGroup.value.startDate,this.reportService.dateRangeFormGroup.value.endDate).then((bills)=>{
        bills = bills.filter((bill)=>bill.mode == 'dineIn');
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
