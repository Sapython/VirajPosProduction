import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-non-chargeable-bills',
  templateUrl: './non-chargeable-bills.component.html',
  styleUrls: ['./non-chargeable-bills.component.scss']
})
export class NonChargeableBillsComponent {
  
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
        bills = bills.filter((bill)=>bill.nonChargeableDetail);
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
