import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../report.service';
import { Tax } from '../../../../../../types/tax.structure';
import { KotConstructor } from '../../../../../../types/kot.structure';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-consolidated',
  templateUrl: './consolidated.component.html',
  styleUrls: ['./consolidated.component.scss'],
})
export class ConsolidatedComponent implements OnInit {
  consolidatedSummary = {
    bills: [],
    totalSubtotal: 0,
    totalGrandTotal: 0,
    totalTaxes: [],
  };
  loading: boolean = false;
  constructor(public reportService: ReportService,private dataProvider:DataProvider) {
    this.reportService.refetchConsolidated.subscribe(() => {
      this.ngOnInit();
    })
  }
  ngOnInit(): void {
    this.loading = true;
    this.reportService
      .getBills(
        this.reportService.dateRangeFormGroup.value.startDate,
        this.reportService.dateRangeFormGroup.value.endDate,
      )
      .then((localBills) => {
        console.log("bills local",localBills);
        let filteredLocalBills = localBills.filter(
          (res) =>
            res.settlement &&
            res.billing.grandTotal < this.reportService.consolidatedMaxAmount &&
            res.billing.grandTotal > 0,
        );
        //  console.log("bills",filteredLocalBills);
        let taxes: Tax[] = [];
        filteredLocalBills.forEach((bill) => {
          bill.billing.taxes.forEach((tax) => {
            let index = taxes.findIndex((res) => res.id == tax.id);
            if (index == -1) {
              taxes.push(JSON.parse(JSON.stringify(tax)));
            } else {
              //  console.log("Adding tax",taxes[index].amount,tax.amount,taxes[index].amount + tax.amount);
              taxes[index].amount = taxes[index].amount + tax.amount;
            }
          });
        });
        this.consolidatedSummary = {
          bills: filteredLocalBills,
          totalSubtotal: filteredLocalBills.reduce(
            (acc, res) => acc + res.billing.subTotal,
            0,
          ),
          totalGrandTotal: filteredLocalBills.reduce(
            (acc, res) => acc + res.billing.grandTotal,
            0,
          ),
          totalTaxes: taxes,
        };
        this.loading = false;
      });
    this.reportService.downloadExcel.subscribe(() => {});
  }

  async downloadPdf() {
    const doc = new jsPDF();
    let title = 'Consolidated Report';
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
    doc.save('Consolidated Report' + new Date().toLocaleString() + '.pdf');
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

  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }
}
