import { Component, Input } from '@angular/core';
import { KotConstructor } from '../../../../../../types/kot.structure';
import {
  Product,
  productReport,
} from '../../../../../../types/product.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-item-wise-report',
  templateUrl: './item-wise-report.component.html',
  styleUrls: ['./item-wise-report.component.scss'],
})
export class ItemWiseReportComponent {
  totals = {
    totalNumberOfProducts: 0,
    totalNumberOfBills: 0,
    totalNumberOfKots: 0,
    totalQuantity: 0,
    totalPrice: 0,
    totalAmount: 0,
  }
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;
  products: ReplaySubject<ProductHourlySales[]> = new ReplaySubject<
    ProductHourlySales[]
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
            console.log('Bills ', bills);
            let products = [];
            bills.forEach((bill) => {
              bill.kots.forEach((kot) => {
                kot.products.forEach((product) => {
                  let findIndex = products.findIndex(
                    (res) => res.id == product.id,
                  );
                  if (findIndex == -1) {
                    let newProduct = {
                      ...product,
                      bills: [bill.billNo],
                      kots: [kot.id],
                      quantity: Number(product.quantity),
                    };
                    products.push(newProduct);
                  } else {
                    if (bill.billNo) {
                      products[findIndex].bills = [
                        ...products[findIndex].bills,
                        bill.billNo,
                      ];
                    }
                    if (kot.id) {
                      products[findIndex].kots = [
                        ...products[findIndex].kots,
                        kot.id,
                      ];
                    }
                    products[findIndex].quantity += Number(product.quantity);
                  }
                });
              });
            });
            this.totals.totalNumberOfProducts = products.length;
            this.totals.totalNumberOfBills = bills.length;
            this.totals.totalNumberOfKots = bills.reduce(
              (acc, cur) => acc + Number(cur.kots.length),
              0,
            );
            this.totals.totalQuantity = products.reduce(
              (acc, cur) => acc + Number(cur.quantity),
              0,
            );
            this.totals.totalPrice = products.reduce(
              (acc, cur) => acc + Number(cur.price),
              0,
            );
            this.totals.totalAmount = products.reduce(
              (acc, cur) => acc + Number(cur.price * cur.quantity),
              0,
            );
            // total amount is the total price of all the products
            this.products.next(products);
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
    let title = 'Item Wise';
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
    doc.save('Item Wise Report' + new Date().toLocaleString() + '.pdf');
  }

  downloadExcel() {
    console.log("Downloading excel");
    
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
      'item_wise_report' + new Date().toLocaleString() + '.csv';
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

interface ProductHourlySales extends Product {
  bills: string[];
  kots: string[];
}
