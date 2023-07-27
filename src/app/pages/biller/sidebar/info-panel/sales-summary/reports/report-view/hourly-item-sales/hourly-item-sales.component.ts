import { Component, Input } from '@angular/core';
import { Product, productReport } from '../../../../../../../../types/product.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { ReportService } from '../../report.service';
import { ApplicableCombo } from '../../../../../../../../../../functions/lib/src/app/core/constructors/comboKot/comboKot';
import { ApplicableComboConstructor } from '../../../../../../../../types/combo.structure';

@Component({
  selector: 'app-hourly-item-sales',
  templateUrl: './hourly-item-sales.component.html',
  styleUrls: ['./hourly-item-sales.component.scss']
})
export class HourlyItemSalesComponent {
  hours:number[] = Array(24).fill(0).map((res,index)=>index);
  reportChangedSubscription:Subscription = Subscription.EMPTY;
  items:ReplaySubject<ProductHourlySales[]> = new ReplaySubject<ProductHourlySales[]>();
  loading:boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService:ReportService){}

  ngOnInit(): void {
    this.reportService.dataChanged.subscribe(()=>{
      this.reportService.getBills(this.reportService.dateRangeFormGroup.value.startDate,this.reportService.dateRangeFormGroup.value.endDate).then((bills)=>{
        console.log("Bills ",bills);
        let productBaseSales:ProductHourlySales[] = [];
        let allProducts:any[] = [];
        bills.forEach((bill)=>{
          console.log("Bill",bill);
          bill.kots.forEach((kot)=>{
            console.log("Kot",kot);
            kot.products.forEach((product)=>{
              console.log("Product",product);
              if (product.itemType == 'product') {
                let findIndex = productBaseSales.findIndex((res)=>res.id == product.id);
                if (findIndex == -1) {
                  productBaseSales.push({
                    ...product,
                    hourlySales:Array(24).fill(0),
                    itemType:'product'
                  });
                } else {
                  productBaseSales[findIndex].hourlySales[kot.createdDate.toDate().getHours()] += product.quantity;
                }
              } else if (product.itemType == 'combo') {
              }
            });
          });
        });
        console.log("productBaseSales",productBaseSales,"allProducts",allProducts);
        this.items.next(productBaseSales);
      }).finally(()=>{
        this.loading = false;
      });
    })
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}
interface ProductHourlySales extends Product{
  hourlySales:number[],
  itemType:'product'
}
interface ComboHourlySales extends ApplicableComboConstructor{
  hourlySales:number[],
  itemType:'combo'
}
