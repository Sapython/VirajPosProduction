import { Component, Input } from '@angular/core';
import {
  KotConstructor,
  kotReport,
} from '../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { BillConstructor } from '../../../../../../types/bill.structure';
import { ReportService } from '../../report.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { log } from 'console';

@Component({
  selector: 'app-table-wise',
  templateUrl: './table-wise.component.html',
  styleUrls: ['./table-wise.component.scss'],
})
export class TableWiseComponent {
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;
  tableWiseSales: ReplaySubject<TableWiseSales[]> = new ReplaySubject<
    TableWiseSales[]
  >();
  tableWiseTotals:{
    sales:number,
    numberOfOrders:number,
    averageSales:number
  }={
    sales:0,
    numberOfOrders:0,
    averageSales:0
  }
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService: ReportService,private dataProvider: DataProvider,) {}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(
      () => {
        let tableWiseSales: { table: any; orders: number[] }[] = [];
        this.reportService
          .getBills(
            this.reportService.dateRangeFormGroup.value.startDate,
            this.reportService.dateRangeFormGroup.value.endDate,
          )
          .then((bills) => {
            console.log('Bills ', bills);
            bills.forEach((bill) => {
              if (
                tableWiseSales.findIndex(
                  (res) => {
                    console.log('res.table ', res.table,bill.table);
                    return (res.table?.id ? res.table?.id : res.table) == (bill.table.id ? bill.table.id : bill.table)
                  },
                ) == -1
              ) {
                tableWiseSales.push({
                  table: bill.table,
                  orders: [bill.billing.grandTotal],
                });
              } else {
                tableWiseSales[
                  tableWiseSales.findIndex(
                    (res) => {
                      console.log('res.table ', res.table,bill.table);
                      return (res.table.id ? res.table.id : res.table) == (bill.table.id ? bill.table.id : bill.table)
                    }
                  )
                ].orders.push(bill.billing.grandTotal);
              }
            });
            let tableWiseSalesArray: TableWiseSales[] = [];
            tableWiseSales.forEach((res) => {
              tableWiseSalesArray.push({
                table: res.table,
                sales: res.orders.reduce((a, b) => a + b),
                numberOfOrders: res.orders.length,
                averageSales:
                this.roundOff(res.orders.reduce((a, b) => a + b) / res.orders.length),
              });
            });
            tableWiseSalesArray.forEach((res)=>{
              this.tableWiseTotals.sales += res.sales;
              this.tableWiseTotals.numberOfOrders += res.numberOfOrders;
              this.tableWiseTotals.averageSales += res.averageSales;
            })
            console.log('Table Wise Sales ', tableWiseSalesArray);
            this.tableWiseSales.next(tableWiseSalesArray);
          });
      },
    );
    this.downloadPDfSubscription = this.reportService.downloadPdf.subscribe(
      () => {
        this.downloadPdf();
      },
    );
    this.downloadExcelSubscription = this.reportService.downloadExcel.subscribe(
      () => {
        this.downloadExcel();
      },
    );
  }


  async downloadPdf() {
    const doc = new jsPDF();
    let title = 'Table Wise';
    let logo = new Image();
    logo.src = 'assets/images/viraj.png';
    doc.addImage(logo, 'JPEG', 10, 10, 30.5, 17.5);
    doc.setFontSize(25);
    doc.text('Vrajera', 40, 23);
    doc.line(10, 30, 200, 30);
    doc.setFontSize(18);
    let y;
    autoTable(doc, {
      body: [
        [
          {
            content: title + ' Report',
            styles: { halign: 'left', fontSize: 17 },
          },
          {
            content:
              this.reportService.dateRangeFormGroup.value.startDate.toLocaleString(),
            styles: { halign: 'right', fontSize: 17 },
          },
          {
            content:this.reportService.dateRangeFormGroup.value.endDate ? 
              this.reportService.dateRangeFormGroup.value.endDate.toLocaleString() : '',
            styles: { halign: 'right', fontSize: 17 },
          },
        ],
      ],
      theme: 'plain',
      startY: 40,
      didDrawPage: function (data) {
        y = data.cursor.y;
      },
    });
    autoTable(doc, { html: '#reportTable' });
    doc.save('Table Wise Report' + new Date().toLocaleString() + '.pdf');
  }

  downloadExcel() {
    let separator = ',';
    // Select rows from table_id
    var rows = document.querySelectorAll('table#reportTable tr');
    // Construct csv
    let baseData = [
      'Date:',
      new Date().toLocaleString(),
      'User Id:',
      this.dataProvider.currentUser.username,
      'User Name:',
      this.dataProvider.currentBusiness.email,
    ];
    var csv = [baseData.join(separator)];
    for (var i = 0; i < rows.length; i++) {
      var row = [],
        cols: any = rows[i].querySelectorAll('td, th');
      for (var j = 0; j < cols.length; j++) {
        // Clean innertext to remove multiple spaces and jumpline (break csv)
        var data = cols[j].innerText
          .replace(/(\r\n|\n|\r)/gm, '')
          .replace(/(\s\s)/gm, ' ');
        // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
        data = data.replace(/"/g, '""');
        // Push escaped string
        row.push('"' + data + '"');
      }
      csv.push(row.join(separator));
    }
    var csv_string = csv.join('\n');
// csv_string.replace('₹',' ')
    csv_string = csv_string.replace(/₹/g, ' ');
    // Download it
    var filename =
      'table_wise_report' + new Date().toLocaleString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string),
    );
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  roundOff(number:number){
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
    this.downloadPDfSubscription.unsubscribe();
    this.downloadExcelSubscription.unsubscribe();
  }
  
}

interface TableWiseSales {
  table: any;
  sales: number;
  numberOfOrders: number;
  averageSales: number;
}
