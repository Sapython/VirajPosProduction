import { Component } from '@angular/core';
import { Subscription, ReplaySubject } from 'rxjs';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { ReportService } from '../../report.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataProvider } from '../../../../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-day-summary',
  templateUrl: './day-summary.component.html',
  styleUrls: ['./day-summary.component.scss'],
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
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;
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
            console.log('Bills ', bills);
            this.daySummary = {
              totalBills: bills.length,
              totalAmount: bills.reduce(
                (acc, res) => acc + res.billing.grandTotal,
                0,
              ),
              totalDiscount: bills.reduce(
                (acc, res) =>
                  acc +
                  res.billing.discount.reduce(
                    (a, b) => a + (b.totalAppliedDiscount || 0),
                    0,
                  ),
                0,
              ),
              totalTax: bills.reduce(
                (acc, res) => acc + res.billing.totalTax,
                0,
              ),
              totalKots: bills
                .map((res) => res.kots.length)
                .reduce((a, b) => a + b, 0),
              totalProducts: bills
                .map((res) =>
                  res.kots
                    .map((res) => res.products.length)
                    .reduce((a, b) => a + b, 0),
                )
                .reduce((a, b) => a + b, 0),
              totalDiscountedBills: bills.filter(
                (res) => res.billing.discount.length > 0,
              ).length,
              totalDiscountedAmount: bills
                .filter((res) => res.billing.discount.length > 0)
                .reduce((acc, res) => acc + res.billing.grandTotal, 0),
              totalNcBills: bills.filter((res) => res.nonChargeableDetail)
                .length,
              totalNcAmount: bills
                .filter((res) => res.nonChargeableDetail)
                .reduce((acc, res) => acc + res.billing.grandTotal, 0),
              totalTakeawayBills: bills.filter((res) => res.mode == 'takeaway')
                .length,
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
      },
    );
  }


  async downloadPdf() {
    const doc = new jsPDF();
    let title = 'Bill Wise';
    let logo = new Image();
    logo.src = 'assets/images/viraj.png';
    doc.addImage(logo, 'JPEG', 10, 10, 30.5, 17.5);
    doc.setFontSize(25);
    doc.text('Viraj', 40, 23);
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
    doc.save('Bill Wise Report' + new Date().toLocaleString() + '.pdf');
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
      'export_report-table_' + new Date().toLocaleString() + '.csv';
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
