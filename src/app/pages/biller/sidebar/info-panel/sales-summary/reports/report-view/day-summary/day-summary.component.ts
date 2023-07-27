import { Component } from '@angular/core';
import { Subscription, ReplaySubject } from 'rxjs';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-day-summary',
  templateUrl: './day-summary.component.html',
  styleUrls: ['./day-summary.component.scss']
})
export class DaySummaryComponent {
  daySummary = {
    totalBills: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalTax: 0,
    totalKots: 0,
    totalProducts: 0,
    totalDiscountedBills: 0,
    totalDiscountedAmount: 0,
    totalNcBills: 0,
    totalNcAmount: 0,
    totalTakeawayBills: 0,
    totalTakeawayAmount: 0,
    totalOnlineBills: 0,
    totalOnlineAmount: 0,
  };
    
  reportChangedSubscription:Subscription = Subscription.EMPTY;
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
        this.daySummary = {
          totalBills: bills.length,
          totalAmount: bills.reduce(
            (acc, res) => acc + res.billing.grandTotal,
            0
          ),
          totalDiscount: bills.reduce(
            (acc, res) =>
              acc +
              res.billing.discount.reduce(
                (a, b) => a + (b.totalAppliedDiscount || 0),
                0
              ),
            0
          ),
          totalTax: bills.reduce(
            (acc, res) => acc + res.billing.totalTax,
            0
          ),
          totalKots: bills
            .map((res) => res.kots.length)
            .reduce((a, b) => a + b, 0),
          totalProducts: bills
            .map((res) =>
              res.kots
                .map((res) => res.products.length)
                .reduce((a, b) => a + b, 0)
            )
            .reduce((a, b) => a + b, 0),
          totalDiscountedBills: bills.filter(
            (res) => res.billing.discount.length > 0
          ).length,
          totalDiscountedAmount: bills
            .filter((res) => res.billing.discount.length > 0)
            .reduce((acc, res) => acc + res.billing.grandTotal, 0),
          totalNcBills: bills.filter((res) => res.nonChargeableDetail)
            .length,
          totalNcAmount: bills
            .filter((res) => res.nonChargeableDetail)
            .reduce((acc, res) => acc + res.billing.grandTotal, 0),
          totalTakeawayBills: bills.filter(
            (res) => res.mode == 'takeaway'
          ).length,
          totalTakeawayAmount: bills
            .filter((res) => res.mode == 'takeaway')
            .reduce((acc, res) => acc + res.billing.grandTotal, 0),
          totalOnlineBills: bills.filter((res) => res.mode == 'online')
            .length,
          totalOnlineAmount: bills
            .filter((res) => res.mode == 'online')
            .reduce((acc, res) => acc + res.billing.grandTotal, 0),
        };
        this.loading = false;
      });
    })
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}
