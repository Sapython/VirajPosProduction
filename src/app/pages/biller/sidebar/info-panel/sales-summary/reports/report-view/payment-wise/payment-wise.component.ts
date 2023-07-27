import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-payment-wise',
  templateUrl: './payment-wise.component.html',
  styleUrls: ['./payment-wise.component.scss']
})
export class PaymentWiseComponent {
  
  reportChangedSubscription:Subscription = Subscription.EMPTY;
  paymentMethods:ReplaySubject<any> = new ReplaySubject<any>();
  loading:boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService:ReportService){}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(()=>{
      this.loading = true;
      let paymentWise = {};
      this.reportService.getBills(this.reportService.dateRangeFormGroup.value.startDate,this.reportService.dateRangeFormGroup.value.endDate).then((bills)=>{
        console.log("Bills ",bills);
        bills.forEach((bill)=>{
          if(bill.settlement){
            console.log("bill.settlement.payments",bill.settlement.payments);
            if (typeof bill.settlement.payments =='object' && bill.settlement.payments.length){
              bill.settlement.payments.forEach((payment)=>{
                console.log("Payment channel",payment);
                if (payment.paymentMethod == undefined){
                  return
                }
                if (paymentWise[payment.paymentMethod]) {
                  paymentWise[payment.paymentMethod] += payment.amount;
                } else {
                  paymentWise[payment.paymentMethod] = payment.amount;
                }
              });
            }
          }
        });
        console.log("paymentWise",paymentWise);
        this.paymentMethods.next(paymentWise);
        this.loading = false;
      });
    })
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}
