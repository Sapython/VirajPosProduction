import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { ReportService } from '../../report.service';
import { ReplaySubject, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-bill-wise',
  templateUrl: './bill-wise.component.html',
  styleUrls: ['./bill-wise.component.scss']
})
export class BillWiseComponent implements OnInit, OnDestroy {
  
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
