import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription, ReplaySubject } from 'rxjs';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { BillConstructor } from '../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../types/kot.structure';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-combo',
  templateUrl: './combo.component.html',
  styleUrls: ['./combo.component.scss'],
})
export class ComboComponent {
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;
  combos: ReplaySubject<comboReport[]> = new ReplaySubject<
    comboReport[]
  >();
  billTotals:{
    numberOfBills:number,
    numberOfOrders:number,
    total:number,
    numberOfKots:number,
    numberOfUsers:number,
    totalBillTime:string,
    totalAmount:number,
    totalDiscount:number,
    totalTax:number,
  }={
    numberOfBills:0,
    numberOfOrders:0,
    total:0,
    numberOfKots:0,
    numberOfUsers:0,
    totalBillTime:"",
    totalAmount:0,
    totalDiscount:0,
    totalTax:0,
  };
  loading: boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(
    private reportService: ReportService,
    private dataProvider: DataProvider,
  ) {}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(
      () => {
        console.log('Date range ', this.reportService.dateRangeFormGroup.value);
        this.reportService
          .getBills(
            this.reportService.dateRangeFormGroup.value.startDate,
            this.reportService.dateRangeFormGroup.value.endDate,
          )
          .then((bills) => {
            console.log('Bills ', bills);
            // this.bills.next(bills);
            let comboReports:comboReport[] = [];
            bills.forEach((bill) => {
              // check if bill has combo in any kot and add it to the list
              bill.kots.forEach((kot) => {
                kot.products.forEach((combo) => {
                  if(combo.itemType == 'combo'){
                    let comboReportIndex = comboReports.findIndex((res)=>res.comboId == combo.id);
                    if(comboReportIndex == -1){
                      comboReports.push({
                        comboName: combo.name,
                        comboId:combo.id,
                        quantity: combo.quantity,
                        price: combo.price,
                        total: combo.price * combo.quantity,
                        selectedProducts:combo.combo.selectedCategories.map((category)=>{
                          return category.selectedProducts
                        }).flat(),
                        bills: [bill.billNo],
                        kots: [kot.id],
                        billTotal: bill.billing.grandTotal,
                      });
                    } else {
                      comboReports[comboReportIndex].quantity += combo.quantity;
                      comboReports[comboReportIndex].total += combo.price * combo.quantity;
                      comboReports[comboReportIndex].bills.push(bill.billNo);
                      comboReports[comboReportIndex].kots.push(kot.id);
                    }
                  }
                });
              });
            });
            this.combos.next(comboReports);
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
    let title = 'Combo';
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
    doc.save('Combo Wise Report' + new Date().toLocaleString() + '.pdf');
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
      'combo_wise' + new Date().toLocaleString() + '.csv';
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

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
    this.downloadPDfSubscription.unsubscribe();
    this.downloadExcelSubscription.unsubscribe();
  }
}

interface comboReport {
  comboName: string;
  comboId:string;
  quantity: number;
  price: number;
  total: number;
  selectedProducts:any[];
  bills: string[];
  kots: string[];
  billTotal: number;
}