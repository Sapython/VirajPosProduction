import { Component, Input, OnInit } from '@angular/core';
import { kotReport } from '../../../../../../types/kot.structure';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subject, Subscription } from 'rxjs';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { ReportService } from '../../report.service';
import { timedBillConstructor } from '../bill-wise/bill-wise.component';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-kot-edits',
  templateUrl: './kot-edits.component.html',
  styleUrls: ['./kot-edits.component.scss'],
})
export class KotEditsComponent implements OnInit {
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;

  kotEditsActivity:Subject<kotEdit[]> = new Subject<kotEdit[]>();


  constructor(private dataProvider: DataProvider,private reportService:ReportService) {}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(
      () => {
        this.reportService
          .getBills(
            this.reportService.dateRangeFormGroup.value.startDate,
            this.reportService.dateRangeFormGroup.value.endDate,
          )
          .then((bills) => {
            console.log('Bills ', bills);
            bills = bills.filter((bill)=>bill.orderNo);
            let activities:kotEdit[] = []
            bills.forEach((bill)=>{
              bill.activities.forEach((activity)=>{
                if(activity?.activity?.type == 'kotEdited'){
                  activities.push({
                    id:activity.activity.data.id,
                    billNo:bill.billNo,
                    billStartTime:bill.createdDate,
                    kotEditTime:activity.createdDate,
                    mode:bill.mode,
                    orderNo:bill.orderNo,
                    products:activity.activity.data.products,
                    reason:activity.activity.data.editReason,
                    table:bill.table?.name || (bill.table as unknown as string),
                    user:activity.activity.user
                  })
                }
              })
            });
            this.kotEditsActivity.next(activities);
            console.log("Kot edits activity",this.kotEditsActivity);
            // let productBaseSales: timedBillConstructor[] = bills.map((bill) => {
            //   let totalBillTime = '';
            //   if (bill?.createdDate?.toDate() && bill.settlement?.time?.toDate()) {
            //     let billTime = new Date(bill.createdDate?.toDate());
            //     // time difference between bill.createdDate time and bill.settlement.time
            //     let settlementTime = new Date(bill.settlement?.time.toDate());
            //     let timeDifference = settlementTime.getTime() - billTime.getTime();
            //     billTime = new Date(timeDifference);
            //     let hours = billTime.getHours();
            //     let minutes = billTime.getMinutes();
            //     let seconds = billTime.getSeconds();
            //     totalBillTime = `${hours}:${minutes}:${seconds}`;
            //   };
            //   let mergedProducts = [];
            //   bill.kots.forEach((kot) =>{
            //     if (kot.products) {
            //       kot.products.forEach((product) => {
            //         let index = mergedProducts.findIndex((res) => res.id === product.id);
            //         if (index === -1) {
            //           mergedProducts.push(product);
            //         } else {
            //           mergedProducts[index].quantity += product.quantity;
            //         }
            //       })
            //     }
            //   });
            //   return {
            //     ...bill,
            //     totalBillTime,
            //     mergedProducts
            //   };
            // });
            // this.billTotals ={
            //   numberOfBills:bills.reduce((acc, curr) => curr.billNo ? acc + 1 : acc, 0),
            //   numberOfOrders:bills.reduce((acc, curr) => curr.orderNo ? acc + 1 : acc, 0),
            //   total:bills.reduce((acc, curr) => acc + (curr.cancelledReason ? 0 : curr.billing.grandTotal), 0),
            //   numberOfKots:bills.reduce((acc, curr) => acc + curr.kots.length, 0),
            //   numberOfUsers:bills.reduce((acc, curr) => acc + curr.kots.length, 0),
            //   totalBillTime:productBaseSales.filter((bill)=>bill.totalBillTime).reduce((acc, curr) => {
            //     let timeArray = curr.totalBillTime.split(':');
            //     let hours = parseInt(timeArray[0]);
            //     let minutes = parseInt(timeArray[1]);
            //     let seconds = parseInt(timeArray[2]);
            //     acc[0] += hours;
            //     acc[1] += minutes;
            //     acc[2] += seconds;
            //     if (acc[2] > 60) {
            //       acc[1] += Math.floor(acc[2] / 60);
            //       acc[2] = acc[2] % 60;
            //     }
            //     if (acc[1] > 60) {
            //       acc[0] += Math.floor(acc[1] / 60);
            //       acc[1] = acc[1] % 60;
            //     }
            //     console.log("Time formatted",acc);
            //     return acc;
            //   }, [0, 0, 0]).join(':'),
            //   totalAmount:bills.reduce((acc, curr) => acc + curr.billing.grandTotal, 0),
            //   totalDiscount:bills.reduce((acc, curr) => acc + 
            //     curr.billing.discount.reduce((acc, curr) => acc + curr.totalAppliedDiscount, 0)
            //   , 0),
            //   totalTax:bills.reduce((acc, curr) => acc + curr.billing.taxes.reduce((acc, curr) => acc + curr.amount, 0), 0),
            // };
            // console.log("Bill totals",this.billTotals);
            // this.bills.next(productBaseSales);
            // this.loading = false;
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
    let title = 'KOT Edits';
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
    doc.save('Kot Edits Report' + new Date().toLocaleString() + '.pdf');
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
    // Download it
    var filename =
      'kot_edits' + new Date().toLocaleString() + '.csv';
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
}

interface kotEdit {
  id: string;
  billNo:string;
  orderNo:string;
  reason:string;
  user:string;
  table:string;
  mode:string;
  billStartTime:Timestamp;
  kotEditTime:Timestamp;
  products:any[];
}