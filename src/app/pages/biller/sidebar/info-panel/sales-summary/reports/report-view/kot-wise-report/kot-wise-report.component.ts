import { Component, Input } from '@angular/core';
import { KotConstructor, kotReport } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-kot-wise-report',
  templateUrl: './kot-wise-report.component.html',
  styleUrls: ['./kot-wise-report.component.scss']
})
export class KotWiseReportComponent {
  
  reportChangedSubscription:Subscription = Subscription.EMPTY;
  kots:ReplaySubject<SalesKot[]> = new ReplaySubject<SalesKot[]>();
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
        let kots = []
        bills.forEach((bill)=>{
          bill.kots.forEach((kot)=>{
            let kotData:SalesKot = {
              ...kot,
              grandTotal:kot.products.reduce((acc,cur)=>acc+cur.untaxedValue,0),
              billNo:bill.billNo
            }
            kots.push(kotData);
          });
        });
        this.kots.next(kots);
        this.loading = false;
      });
    })
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}

interface SalesKot extends KotConstructor{
  grandTotal:number,
  billNo:string,
}