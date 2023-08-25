import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';
import { Product } from '../../../../../../types/product.structure';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-waiter-wise-items',
  templateUrl: './waiter-wise-items.component.html',
  styleUrls: ['./waiter-wise-items.component.scss'],
})
export class WaiterWiseItemsComponent {
  totalProducts: number = 0;
  userTotals:{user:string,numberOfOrders:number,sales:number,averageSales:number}[]=[];
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;
  waiterWiseSales: ReplaySubject<WaiterWiseSales> =
    new ReplaySubject<WaiterWiseSales>();
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
            let products: {
              product: Product;
              users: {
                user: string;
                sales: number;
              }[];
            }[] = [];
            let users: string[] = [];
            bills.forEach((bill) => {
              bill.kots.forEach((kot) => {
                if (kot.user) {
                  console.log('kot user:', kot.user);
                  if (
                    users.findIndex((res) => res == kot.user.username) == -1
                  ) {
                    users.push(kot.user.username);
                  }
                  kot.products.forEach((product) => {
                    let findIndex = products.findIndex(
                      (res) => res.product.id == product.id,
                    );
                    if (findIndex == -1) {
                      if (product.itemType == 'product') {
                        products.push({
                          product: product,
                          users: [
                            {
                              user: kot.user.username,
                              sales: product.quantity,
                            },
                          ],
                        });
                      }
                    } else {
                      if (product.itemType == 'product') {
                        let findUserIndex = products[findIndex].users.findIndex(
                          (res) => res.user == kot.user.username,
                        );
                        if (findUserIndex == -1) {
                          products[findIndex].users.push({
                            user: kot.user.username,
                            sales: product.quantity,
                          });
                        } else {
                          products[findIndex].users[findUserIndex].sales +=
                            product.quantity;
                        }
                      }
                    }
                  });
                }
              });
            });
            this.totalProducts = products.length;
              this.userTotals = [];
              products.forEach((res)=>{
                let totalSales = 0;
                let findIndex = this.userTotals.findIndex((user)=>user.user == res.users[0].user);
                if(findIndex == -1){
                  res.users.forEach((user)=>{
                    totalSales += user.sales;
                  });
                  this.userTotals.push({
                    user:res.users[0].user,
                    numberOfOrders:res.users.length,
                    sales:totalSales,
                    averageSales:roundOffPipe(totalSales/res.users.length)
                  });
                } else {
                  res.users.forEach((user)=>{
                    totalSales += user.sales;
                  });
                  this.userTotals[findIndex].numberOfOrders += res.users.length;
                  this.userTotals[findIndex].sales += totalSales;
                  this.userTotals[findIndex].averageSales = roundOffPipe(this.userTotals[findIndex].sales/this.userTotals[findIndex].numberOfOrders);
                }
              });
            // we have to create a array of users
            console.log('users wise sales', products);
            this.waiterWiseSales.next({
              users: users,
              productSales: products,
            });
            // now
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
    let title = 'Waiter Wise';
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
    doc.save('Waiter Wise Report' + new Date().toLocaleString() + '.pdf');
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
      'waiter_wise_report' + new Date().toLocaleString() + '.csv';
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

interface ProductStaffSales extends Product {
  user: string;
}

interface WaiterWiseSales {
  users: string[];
  productSales: {
    product: Product;
    users: {
      user: string;
      sales: number;
    }[];
  }[];
}
[];

function roundOffPipe(num: number) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}