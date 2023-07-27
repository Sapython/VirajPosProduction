import { Component, Input } from '@angular/core';
import { KotConstructor, kotReport } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-table-wise',
  templateUrl: './table-wise.component.html',
  styleUrls: ['./table-wise.component.scss']
})
export class TableWiseComponent {
  reportChangedSubscription:Subscription = Subscription.EMPTY;
  tableWiseSales:ReplaySubject<TableWiseSales[]> = new ReplaySubject<TableWiseSales[]>();
  loading:boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService:ReportService){}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(()=>{
      this.loading = true;
      let tableWiseSales:{table:string,orders:number[]}[] = [];
      this.reportService.getBills(this.reportService.dateRangeFormGroup.value.startDate,this.reportService.dateRangeFormGroup.value.endDate).then((bills)=>{
        console.log("Bills ",bills);
        bills.forEach((bill)=>{
          if (tableWiseSales.findIndex((res)=>res.table == bill.table.name) == -1) {
            tableWiseSales.push({
              table:bill.table.name,
              orders:[bill.billing.grandTotal],
            });
          } else {
            tableWiseSales[tableWiseSales.findIndex((res)=>res.table == bill.table.name)].orders.push(bill.billing.grandTotal);
          }
        });
        let tableWiseSalesArray:TableWiseSales[] = [];
        tableWiseSales.forEach((res)=>{
          tableWiseSalesArray.push({
            table:res.table,
            sales:res.orders.reduce((a,b)=>a+b),
            numberOfOrders:res.orders.length,
            averageSales:res.orders.reduce((a,b)=>a+b)/res.orders.length,
          });
        });
        this.tableWiseSales.next(tableWiseSalesArray);
      });
    })
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}

interface TableWiseSales {
  table:string;
  sales:number;
  numberOfOrders:number;
  averageSales:number;
}