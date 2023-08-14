import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataProvider } from '../../../../../../../../core/services/provider/data-provider.service';
import { timedBillConstructor } from '../bill-wise/bill-wise.component';

@Component({
  selector: 'app-non-chargeable-bills',
  templateUrl: './non-chargeable-bills.component.html',
  styleUrls: ['./non-chargeable-bills.component.scss'],
})
export class NonChargeableBillsComponent {
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;
  bills: ReplaySubject<timedBillConstructor[]> = new ReplaySubject<
    timedBillConstructor[]
  >();
  loading: boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService: ReportService,private dataProvider: DataProvider,) {}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(
      () => {
        this.loading = true;
        this.reportService
          .getBills(
            this.reportService.dateRangeFormGroup.value.startDate,
            this.reportService.dateRangeFormGroup.value.endDate,
          )
          .then((bills) => {
            bills = bills.filter((bill) => bill.nonChargeableDetail);
            let timedBills: timedBillConstructor[] = bills.map((bill) => {
              let totalBillTime = '';
              if (bill?.createdDate?.toDate() && bill.settlement?.time?.toDate()) {
                let billTime = new Date(bill.createdDate?.toDate());
                // time difference between bill.createdDate time and bill.settlement.time
                let settlementTime = new Date(bill.settlement?.time.toDate());
                let timeDifference = settlementTime.getTime() - billTime.getTime();
                billTime = new Date(timeDifference);
                let hours = billTime.getHours();
                let minutes = billTime.getMinutes();
                let seconds = billTime.getSeconds();
                totalBillTime = `${hours}:${minutes}:${seconds}`;
              };
              let mergedProducts = [];
              bill.kots.forEach((kot) =>{
                if (kot.products) {
                  kot.products.forEach((product) => {
                    let index = mergedProducts.findIndex((res) => res.id === product.id);
                    if (index === -1) {
                      mergedProducts.push(product);
                    } else {
                      mergedProducts[index].quantity += product.quantity;
                    }
                  })
                }
              });
              return {
                ...bill,
                totalBillTime,
                mergedProducts
              };
            });
            console.log('Bills ', timedBills);
            this.bills.next(timedBills);
            this.loading = false;
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
    let title = 'Non Chargeable Bill Wise';
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
        ],
      ],
      theme: 'plain',
      startY: 40,
      didDrawPage: function (data) {
        y = data.cursor.y;
      },
    });
    autoTable(doc, { html: '#reportTable' });
    doc.save('Non Chargeable Bill Wise Report' + new Date().toLocaleString() + '.pdf');
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
      'non_chargeable_bill_wise' + new Date().toLocaleString() + '.csv';
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
    this.downloadPDfSubscription.unsubscribe();
    this.downloadExcelSubscription.unsubscribe();
    this.reportChangedSubscription.unsubscribe();
  }
}
