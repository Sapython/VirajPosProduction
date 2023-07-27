import { Component, Input } from '@angular/core';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Product, productReport } from '../../../../../../../../types/product.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-item-wise-report',
  templateUrl: './item-wise-report.component.html',
  styleUrls: ['./item-wise-report.component.scss']
})
export class ItemWiseReportComponent {
  
  reportChangedSubscription:Subscription = Subscription.EMPTY;
  products:ReplaySubject<ProductHourlySales[]> = new ReplaySubject<ProductHourlySales[]>();
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
        let products = []
        bills.forEach((bill)=>{
          bill.kots.forEach((kot)=>{
            kot.products.forEach((product)=>{
              let findIndex = products.findIndex((res)=>res.id == product.id);
              if (findIndex == -1) {
                let newProduct = {
                  ...product,
                  bills:[bill.billNo],
                  kots:[kot.id]
                }
                products.push(newProduct);
              } else {
                if (bill.billNo){
                  products[findIndex].bills = [...products[findIndex].bills,bill.billNo];
                }
                if (kot.id){
                  products[findIndex].kots = [...products[findIndex].kots,kot.id];
                }
                products[findIndex].quantity += product.quantity;
              }
            });
          });
        });
        this.products.next(products);
        this.loading = false;
      });
    })
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}

interface ProductHourlySales extends Product{
  bills:string[];
  kots:string[];
}