import { Component } from '@angular/core';
import { ReportService } from '../../report.service';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { BillConstructor } from '../../../../../../types/bill.structure';
import { Subject } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-split-bills',
  templateUrl: './split-bills.component.html',
  styleUrls: ['./split-bills.component.scss'],
})
export class SplitBillsComponent {
  bills:Subject<ExtendedSplittedBill[]> = new Subject<ExtendedSplittedBill[]>();
  splitBillTotals:{
    totalSales:number,
    splittedBillTotal:number,
    totalTax:number;
    totalDiscount:number;
  }={
    totalSales:0,
    splittedBillTotal:0,
    totalTax:0,
    totalDiscount:0,
  }
  constructor(private reportService:ReportService,private dataProvider:DataProvider) {
    this.reportService.dataChanged.subscribe(()=>{
      this.reportService.getBills(this.reportService.dateRangeFormGroup.value.startDate,this.reportService.dateRangeFormGroup.value.endDate).then(async (res)=>{
        this.bills.next([]);
        let finalizedBills = []
        await Promise.all(res.map(async (bill)=>{
          if(bill?.settlement?.additionalInfo?.splitBill && bill?.settlement?.additionalInfo?.bills?.length > 0){
            let bills = await Promise.all(bill?.settlement?.additionalInfo.bills.map(async (splitBillId:string)=>{
              let billDoc = await this.reportService.getSplittedBill(bill.id,splitBillId,this.dataProvider.currentBusiness.businessId);
              return billDoc.data();
            }));
            bills.forEach((splittedBill)=>{
              console.log("splittedBill",splittedBill);
              finalizedBills.push({
                ...splittedBill,
                originalBillId:bill.id,
                originalBillAmount:bill.billing.grandTotal,
                originalBillNo:bill.billNo,
              });
            });
          }
        }));
        this.splitBillTotals.totalSales = finalizedBills.reduce((acc,curr)=>acc+curr.originalBillAmount,0);
        this.splitBillTotals.splittedBillTotal = finalizedBills.reduce((acc,curr)=>acc+curr.billing.grandTotal,0);
        this.splitBillTotals.totalTax = finalizedBills.reduce((acc, curr) => acc + curr.billing.taxes.reduce((acc, curr) => acc + curr.amount, 0), 0);
        this.splitBillTotals.totalDiscount = finalizedBills.reduce((acc, curr) => acc + curr.billing.discount.reduce((acc, curr) => acc + curr.totalAppliedDiscount, 0),0);
        this.bills.next(finalizedBills);
      });
    });
    this.reportService.downloadExcel.subscribe(()=>{
      this.downloadExcel();
    });
    this.reportService.downloadPdf.subscribe(()=>{
      this.downloadPdf();
    });
  }

  async downloadPdf() {
    const doc = new jsPDF('l','mm', [500, 300]);
    let title = 'Splitted Bills';
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
    doc.save('Split Bill Wise Report' + new Date().toLocaleString() + '.pdf');
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
      'split_bills' + new Date().toLocaleString() + '.csv';
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


  getReport(){

  }
}

interface ExtendedSplittedBill extends BillConstructor{
  originalBillId:string;
  originalBillAmount:number;
  originalBillNo:string;
}