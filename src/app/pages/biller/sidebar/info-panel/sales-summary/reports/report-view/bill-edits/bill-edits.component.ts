import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';
import { Timestamp } from '@angular/fire/firestore';
import { BillActivity } from '../../../../../../../../types/activity.structure';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-bill-edits',
  templateUrl: './bill-edits.component.html',
  styleUrls: ['./bill-edits.component.scss'],
})
export class BillEditsComponent {
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;
  bills: ReplaySubject<BillEdit[]> = new ReplaySubject<BillEdit[]>();
  loading: boolean = true;
  dataProvider: any;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService: ReportService) {}

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
            let billEdits: BillEdit[] = [];
            bills.forEach((bill) => {
              // go into every activity of every bill and filter out every activity that is of type billReactivated
              bill.activities = bill.activities.filter(
                (activity: {
                  activity: BillActivity;
                  createdDate: Timestamp;
                }) => activity.activity.type == 'billReactivated',
              );
              bill.activities.forEach(
                (activity: {
                  activity: BillActivity;
                  createdDate: Timestamp;
                }) => {
                  billEdits.push({
                    bill: bill,
                    reason: activity.activity.data.reason,
                    message: activity.activity.message,
                    time: activity.createdDate,
                    user: activity.activity.user,
                  });
                },
              );
            });
            this.bills.next(billEdits);
            this.loading = false;
          });
      },
    );
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
    this.downloadPDfSubscription.unsubscribe();
    this.downloadExcelSubscription.unsubscribe();
  }

  async downloadPdf() {
    const doc = new jsPDF();
    let title = 'Bill Edits';
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
    doc.save('Bill Edits Report' + new Date().toLocaleString() + '.pdf');
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
      'bill_Edits' + new Date().toLocaleString() + '.csv';
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

interface BillEdit {
  bill: BillConstructor;
  reason: string;
  user: string;
  time: Timestamp;
  message: string;
}
