import { Component, OnInit, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BillService } from '../../../../../../core/services/database/bill/bill.service';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { BillConstructor } from '../../../../../../types/bill.structure';
import { TableConstructor } from '../../../../../../types/table.structure';
import { Tax } from '../../../../../../types/tax.structure';
import {
  KotConstructor,
  kotReport,
} from '../../../../../../types/kot.structure';
import {
  Product,
  productReport,
} from '../../../../../../types/product.structure';
import { Chart } from 'chart.js';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ReportViewComponent } from './report-view/report-view.component';
import { Subject, debounceTime } from 'rxjs';
import Fuse from 'fuse.js';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  reportFormats:ReportFormat[] = [
    {
      title: 'Item Wise Sales',
      code: 'itemWise',
      description: 'List of items and their sales, with bills and kots.',
    },
    {
      title: 'All Bills',
      code: 'billWise',
      description:
        'List of bills from all channels, with their sales and settlements.',
    },
    {
      title: 'Dine In Bills',
      code: 'dineInBills',
      description:
        'List of bills from dine in channel, with their sales and settlements.',
    },
    {
      title: 'Takeaway Bills',
      code: 'takeawayBills',
      description:
        'List of bills from takeaway channel, with their sales and settlements.',
    },
    {
      title: 'Online Bills',
      code: 'onlineBills',
      description:
        'List of bills from online channel, with their sales and settlements.',
    },
    {
      title: 'Table Wise Sales',
      code: 'tableWiseSales',
      description:
        'List of bills from online channel, with their sales and settlements.',
    },
    {
      title: 'Day Summary',
      code: 'daySummary',
      description:
        'Full day summary with all bills, kots, sales, settlements, etc.',
    },
    {
      title: 'KOT wise report',
      code: 'kotWise',
      description: 'List of KOTs with their timings, waiter, items.',
    },
    {
      title: 'Discounted Bills',
      code: 'discounted',
      description:
        'List of bills on which discount has been applied, and discounted amount.',
    },
    {
      title: 'Non Chargeable Bills',
      code: 'ncBills',
      description: 'List of bills which have been marked as NC.',
    },
    {
      title: 'Bill Edits',
      code: 'billEdits',
      description:
        'List of bills which have been edited, with name and timings.',
    },
    {
      title: 'Customer Wise Report',
      code: 'customerWiseReport',
      description: 'List of customers and their spending with loyalty points.',
    },
    {
      title: 'Hourly Item Sales',
      code: 'hourlyItemSales',
      description: 'List of items sold by per hour basis in 24 hours.',
    },
    {
      title: 'Kot Edits',
      code: 'kotEdits',
      description: 'List of KOTs that has been edited, with name and timings.',
    },
    {
      title: 'Payment Wise',
      code: 'paymentWise',
      description: 'List of payment channels and their total received money.',
    },
    {
      title: 'Waiter wise items',
      code: 'waiterWiseItems',
      description: 'List of items and what waiter has ordered.',
    },
    {
      title: 'Table Wise Activity',
      code: 'tableWiseActivity',
      description: 'List of tables with merge, exchange, split actions.',
    },
  ];
  fuseSearchInstance:Fuse<ReportFormat> = new Fuse(this.reportFormats,{keys:['title','description']});
  filteredReportFormats:ReportFormat[] = [];
  reportSearchSubject:Subject<string> = new Subject<string>();
  @ViewChild('salesChart') salesChart:
    | { nativeElement: HTMLCanvasElement }
    | undefined;
  @ViewChild('orderChart') orderChart:
    | { nativeElement: HTMLCanvasElement }
    | undefined;
  constructor(
    private billService: BillService,
    private dataProvider: DataProvider,
    private dialog: Dialog,
    public dialogRef: DialogRef,
  ) {
    this.filteredReportFormats = this.reportFormats.slice();
    this.reportSearchSubject.pipe(debounceTime(600)).subscribe((res) => {
      if (res.trim().length > 0) {
        this.filteredReportFormats = this.fuseSearchInstance.search(res.trim()).map(res=>res.item);
      } else {
        this.filteredReportFormats = this.reportFormats.slice();
      }
    })
  }
  salesChartJS: Chart | undefined;
  paymentChartJS: any;
  selectedDate: Date = new Date();
  barThickness = 40;
  // Reports
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
  consolidatedSummary = {
    bills: [],
    totalSubtotal: 0,
    totalGrandTotal: 0,
    totalTaxes: [],
  };
  maxAmount: number = 0;
  tokenWiseBills: BillConstructor[] = [];
  bills: BillConstructor[] = [];
  kots: kotReport[] = [];
  products: productReport[] = [];
  discountedBills: BillConstructor[] = [];
  ncBills: BillConstructor[] = [];
  takeawayBills: BillConstructor[] = [];
  onlineBills: BillConstructor[] = [];
  tables: TableConstructor[] = [];
  loading: boolean = false;
  reportMode:
    | 'billWise'
    | 'kotWise'
    | 'itemWise'
    | 'discounted'
    | 'ncBills'
    | 'takeawayBills'
    | 'onlineBills'
    | 'daySummary'
    | 'consolidated'
    | 'takeawayTokenWise'
    | 'onlineTokenWise'
    | 'tableWise'
    | false = false;
  range = new FormGroup({
    start: new FormControl<Date | null>(new Date(), [Validators.required]),
    end: new FormControl<Date | null>(new Date(), [Validators.required]),
  });
  ngOnInit(): void {
    this.fetchChartSalesData({ value: new Date() });
    this.fetchChartPaymentData({ value: new Date() });
  }

  fetchChartSalesData(event: { value: Date }) {
    console.log('Event', event);
    this.billService.getAnalyticsReport(event.value).then((res) => {
      console.log('Analytics data Res', res.data());
      let resData = res.data();
      if (resData) {
        let labels = [];
        // generate labels for 24 hour format like 1:00 AM, 2:00 AM, 3:00 AM
        for (let i = 0; i < 24; i++) {
          let hour = i % 12;
          if (hour == 0) hour = 12;
          labels.push(hour + ':00 ' + (i < 12 ? 'AM' : 'PM'));
        }
        this.salesChartJS.data = {
          labels: labels,
          datasets: [
            {
              label: 'Sale Per Hour',
              data: [...resData.salesChannels.all.hourlySales],
              borderWidth: 1,
              tension: 0.4,
            },
            {
              label: 'Average Sales',
              data: [...resData.salesChannels.all.averageHourlySales],
              borderWidth: 1,
              tension: 0.4,
            },
          ],
        };
        this.salesChartJS.update();
      } else {
        alert('No data found for this date');
      }
    });
  }

  fetchChartPaymentData(event: any) {
    console.log('Event', event);
    this.billService.getAnalyticsReport(event.value).then((res) => {
      console.log('Analytics data Res', res);
      let resData = res.data();
      if (resData) {
        let labels = Object.keys(resData.salesChannels.all.paymentReceived);
        let payments = Object.values(resData.salesChannels.all.paymentReceived);
        this.paymentChartJS.data = {
          labels: labels,
          datasets: [
            {
              label: 'Payment Received',
              data: payments,
              borderWidth: 1,
              hoverOffset: 4,
            },
          ],
        };
        this.paymentChartJS.update();
      } else {
        alert('No data found for this date');
      }
    });
  }

  getReport() {
    if (this.range.valid) {
      if (this.reportMode == 'billWise') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            //  console.log("bills",bills.docs);
            this.bills = bills.docs.map((doc) => {
              return { ...doc.data(), id: doc.id } as BillConstructor;
            });
            this.loading = false;
          });
      } else if (this.reportMode == 'kotWise') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            let localBills = bills.docs.map((doc) => {
              return { ...doc.data(), id: doc.id } as BillConstructor;
            });
            //  console.log("bills",localBills);
            let kotReport = localBills.map((bill) => {
              return bill.kots.map((kot) => {
                return {
                  ...kot,
                  billNo: bill.billNo!,
                  tokenNo: bill.orderNo,
                  grandTotal: kot.products.reduce(
                    (a, b) => a + (b['price'] || 0),
                    0,
                  ),
                };
              });
            });
            this.kots = kotReport.flat();
            //  console.log("kotReport",kotReport,);
            this.loading = false;
          });
      } else if (this.reportMode == 'itemWise') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            let localBills = bills.docs.map((doc) => {
              return { ...doc.data(), id: doc.id } as BillConstructor;
            });
            //  console.log("bills",localBills);
            let kotReport = localBills.map((bill) => {
              return bill.kots.map((kot) => {
                let products = [];
                kot.products.forEach((product) => {
                  if (product.itemType == 'product') {
                    products.push(product);
                  } else if (product.itemType == 'combo') {
                    product.productSelection.forEach((item) => {
                      item.products.forEach((product) => {
                        products.push(product);
                      });
                    });
                  }
                });
                // remove duplicates by adding quantity
                products = products.reduce((acc, current) => {
                  const x = acc.find((item) => item.id === current.id);
                  if (!x) {
                    return acc.concat([current]);
                  } else {
                    x.quantity += current.quantity;
                    return acc;
                  }
                }, []);
                return products.map((product) => {
                  return {
                    ...product,
                    billNo: bill.billNo!,
                    kotNo: kot.id,
                    grandTotal: kot.products.reduce(
                      (a, b) => a + (b['price'] || 0),
                      0,
                    ),
                  };
                });
              });
            });
            let productReport = kotReport.flat().flat();
            //  console.log("productReport",productReport);
            this.products = productReport.reduce((a, b) => {
              let index = a.findIndex((res) => res.id == b.id);
              if (index == -1) {
                return [
                  ...a,
                  {
                    ...b,
                    bills: b.billNo ? b.billNo : '',
                    kots: b.kotNo ? b.kotNo : '',
                    quantity: 1,
                    amount: b.price,
                  },
                ];
              } else {
                return [
                  ...a.slice(0, index),
                  {
                    ...a[index],
                    bills: a[index].bills + (b.billNo ? ',' + b.billNo : ''),
                    kots: a[index].kots + (b.kotNo ? ',' + b.kotNo : ''),
                    quantity: a[index].quantity + 1,
                    amount: a[index].amount + b.price,
                  },
                  ...a.slice(index + 1),
                ];
              }
            }, [] as productReport[]);
            //  console.log("productReport",this.products);
            this.loading = false;
          });
      } else if (this.reportMode == 'discounted') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            this.discountedBills = bills.docs
              .map((doc) => {
                return { ...doc.data(), id: doc.id } as BillConstructor;
              })
              .filter((res) => res.billing.discount.length > 0);
            this.loading = false;
          });
      } else if (this.reportMode == 'ncBills') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            this.ncBills = bills.docs
              .map((doc) => {
                return { ...doc.data(), id: doc.id } as BillConstructor;
              })
              .filter((res) => res.nonChargeableDetail);
            this.loading = false;
          });
      } else if (this.reportMode == 'takeawayBills') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            this.takeawayBills = bills.docs
              .map((doc) => {
                return { ...doc.data(), id: doc.id } as BillConstructor;
              })
              .filter((res) => res.mode == 'takeaway');
            this.loading = false;
          });
      } else if (this.reportMode == 'onlineBills') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            this.onlineBills = bills.docs
              .map((doc) => {
                return { ...doc.data(), id: doc.id } as BillConstructor;
              })
              .filter((res) => res.mode == 'online');
            this.loading = false;
          });
      } else if (this.reportMode == 'daySummary') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            let localBills = bills.docs.map((doc) => {
              return { ...doc.data(), id: doc.id } as BillConstructor;
            });
            this.daySummary = {
              totalBills: localBills.length,
              totalAmount: localBills.reduce(
                (acc, res) => acc + res.billing.grandTotal,
                0,
              ),
              totalDiscount: localBills.reduce(
                (acc, res) =>
                  acc +
                  res.billing.discount.reduce(
                    (a, b) => a + (b.totalAppliedDiscount || 0),
                    0,
                  ),
                0,
              ),
              totalTax: localBills.reduce(
                (acc, res) => acc + res.billing.totalTax,
                0,
              ),
              totalKots: localBills
                .map((res) => res.kots.length)
                .reduce((a, b) => a + b, 0),
              totalProducts: localBills
                .map((res) =>
                  res.kots
                    .map((res) => res.products.length)
                    .reduce((a, b) => a + b, 0),
                )
                .reduce((a, b) => a + b, 0),
              totalDiscountedBills: localBills.filter(
                (res) => res.billing.discount.length > 0,
              ).length,
              totalDiscountedAmount: localBills
                .filter((res) => res.billing.discount.length > 0)
                .reduce((acc, res) => acc + res.billing.grandTotal, 0),
              totalNcBills: localBills.filter((res) => res.nonChargeableDetail)
                .length,
              totalNcAmount: localBills
                .filter((res) => res.nonChargeableDetail)
                .reduce((acc, res) => acc + res.billing.grandTotal, 0),
              totalTakeawayBills: localBills.filter(
                (res) => res.mode == 'takeaway',
              ).length,
              totalTakeawayAmount: localBills
                .filter((res) => res.mode == 'takeaway')
                .reduce((acc, res) => acc + res.billing.grandTotal, 0),
              totalOnlineBills: localBills.filter((res) => res.mode == 'online')
                .length,
              totalOnlineAmount: localBills
                .filter((res) => res.mode == 'online')
                .reduce((acc, res) => acc + res.billing.grandTotal, 0),
            };
            this.loading = false;
          });
      } else if (this.reportMode == 'consolidated') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            let localBills = bills.docs.map((doc) => {
              return { ...doc.data(), id: doc.id } as BillConstructor;
            });
            //  console.log("bills local",localBills);
            let filteredLocalBills = localBills.filter(
              (res) =>
                res.settlement &&
                res.billing.grandTotal < this.maxAmount &&
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
      } else if (this.reportMode == 'takeawayTokenWise') {
        this.loading = true;
        this.billService
          .getBillsByDay(this.range.value.start, this.range.value.end)
          .then((bills) => {
            let localBills = bills.docs.map((doc) => {
              return { ...doc.data(), id: doc.id } as BillConstructor;
            });
            //  console.log("bills local",localBills);
            let filteredLocalBills = localBills.filter(
              (res) => res.settlement && res.mode == 'takeaway',
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
            this.tokenWiseBills = filteredLocalBills;
            this.loading = false;
          });
      } else {
        this.reportMode = false;
      }
    } else {
      alert('Please select a valid date range');
    }
  }

  downloadExcel() {
    let separator = ',';
    // Select rows from table_id
    var rows = document.querySelectorAll('table#report-table tr');
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

  downloadPdf() {
    const doc = new jsPDF();
    let title = '';
    if (this.reportMode == 'daySummary') {
      title = 'Day Summary';
    } else if (this.reportMode == 'billWise') {
      title = 'Bill Wise';
    } else if (this.reportMode == 'kotWise') {
      title = 'Kot Wise';
    } else if (this.reportMode == 'itemWise') {
      title = 'Item Wise';
    } else if (this.reportMode == 'discounted') {
      title = 'Dicounted Bills';
    } else if (this.reportMode == 'ncBills') {
      title = 'Non Chargebale Bills';
    } else if (this.reportMode == 'takeawayBills') {
      title = 'Takeaway Bills';
    } else if (this.reportMode == 'onlineBills') {
      title = 'Online Bills';
    } else if (this.reportMode == 'consolidated') {
      title = 'Consolidated';
    } else if (this.reportMode == 'takeawayTokenWise') {
      title = 'Takeaway Token Wise';
    }
    let logo = new Image();
    logo.src = 'assets/images/viraj.png';
    doc.addImage(logo, 'JPEG', 10, 10, 30.5, 17.5);
    doc.setFontSize(25);
    doc.text('Viraj', 40, 23);
    doc.line(10, 30, 200, 30);
    doc.setFontSize(18);
    // doc.text(title +' Report', 10, 40)
    let y;
    autoTable(doc, {
      body: [
        [
          {
            content: title + ' Report',
            styles: { halign: 'left', fontSize: 17 },
          },
          {
            content: this.selectedDate.toLocaleString(),
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
    doc.setFontSize(13);
    if (this.reportMode != 'itemWise') {
      autoTable(doc, {
        body: [
          [{ content: 'Report', styles: { halign: 'left', fontSize: 15 } }],
        ],
        theme: 'plain',
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
      autoTable(doc, {
        html: '#report-table',
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else {
      if (this.reportMode == 'itemWise') {
        autoTable(doc, {
          body: [
            [{ content: 'Report', styles: { halign: 'left', fontSize: 15 } }],
          ],
          theme: 'plain',
          startY: y + 10,
          didDrawPage: function (data) {
            y = data.cursor.y;
          },
        });
        doc.setFontSize(10);
        autoTable(doc, {
          head: [
            [
              {
                content: 'Product Name',
                styles: {
                  cellWidth: 'wrap',
                },
              },
              {
                content: 'Quantity',
                styles: {
                  cellWidth: 'wrap',
                },
              },
              {
                content: 'Amount',
                styles: {
                  cellWidth: 'wrap',
                },
              },
              {
                content: 'Bills',
                styles: {
                  cellWidth: 'wrap',
                },
              },
              {
                content: 'Kots',
                styles: {
                  cellWidth: 'wrap',
                },
              },
            ],
          ],
          body: this.products
            .filter((res) => res.quantity > 0)
            .map((res) => [
              {
                content: res.name,
                styles: {
                  cellWidth: 'wrap',
                },
              },
              {
                content: res.quantity,
                styles: {
                  cellWidth: 'wrap',
                },
              },
              {
                content: res.amount,
                styles: {
                  cellWidth: 'wrap',
                },
              },
              res.bills,
              res.kots,
            ]),
          startY: y + 10,
          didDrawPage: function (data) {
            y = data.cursor.y;
          },
        });
      }
    }
    if (this.reportMode == 'consolidated') {
      autoTable(doc, {
        body: [
          [
            {
              content: 'Consolidate Summary',
              styles: { halign: 'left', fontSize: 15 },
            },
          ],
        ],
        theme: 'plain',
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
      autoTable(doc, {
        html: '#consolidatedTable',
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else {
      autoTable(doc, {
        body: [
          [{ content: 'Summary', styles: { halign: 'left', fontSize: 15 } }],
        ],
        theme: 'plain',
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    }
    if (this.reportMode == 'billWise') {
      autoTable(doc, {
        body: [
          [
            { content: 'Total Bills', styles: { halign: 'left' } },
            { content: this.bills.length, styles: { halign: 'right' } },
          ],
          [
            { content: 'Total Amount', styles: { halign: 'left' } },
            {
              content: this.bills.reduce(
                (acc, res) => acc + res.billing.grandTotal,
                0,
              ),
              styles: { halign: 'right' },
            },
          ],
          [
            { content: 'Total Discount', styles: { halign: 'left' } },
            {
              content: this.bills.reduce(
                (acc, res) =>
                  acc +
                  res.billing.discount.reduce(
                    (a, b) => a + (b.totalAppliedDiscount || 0),
                    0,
                  ),
                0,
              ),
              styles: { halign: 'right' },
            },
          ],
          [
            { content: 'Total Tax', styles: { halign: 'left' } },
            {
              content: this.bills.reduce(
                (acc, res) => acc + res.billing.totalTax,
                0,
              ),
              styles: { halign: 'right' },
            },
          ],
        ],
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else if (this.reportMode == 'kotWise') {
      autoTable(doc, {
        body: [
          [
            { content: 'Total Kots', styles: { halign: 'left' } },
            { content: this.kots.length, styles: { halign: 'right' } },
          ],
          [
            { content: 'Total Products', styles: { halign: 'left' } },
            {
              content: this.kots
                .map((res) => res.products.length)
                .reduce((a, b) => a + b, 0),
              styles: { halign: 'right' },
            },
          ],
          [
            { content: 'Total Amount', styles: { halign: 'left' } },
            {
              content: this.kots.reduce((acc, res) => acc + res.grandTotal, 0),
              styles: { halign: 'right' },
            },
          ],
        ],
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else if (this.reportMode == 'itemWise') {
      autoTable(doc, {
        body: [
          [
            { content: 'Total Products', styles: { halign: 'left' } },
            { content: this.products.length, styles: { halign: 'right' } },
          ],
          [
            { content: 'Total Amount', styles: { halign: 'left' } },
            {
              content: this.products.reduce((acc, res) => acc + res.amount, 0),
              styles: { halign: 'right' },
            },
          ],
        ],
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else if (this.reportMode == 'discounted') {
      autoTable(doc, {
        body: [
          [
            { content: 'Total Bills', styles: { halign: 'left' } },
            {
              content: this.discountedBills.length,
              styles: { halign: 'right' },
            },
          ],
          [
            { content: 'Total Amount', styles: { halign: 'left' } },
            {
              content: this.discountedBills.reduce(
                (acc, res) => acc + res.billing.grandTotal,
                0,
              ),
              styles: { halign: 'right' },
            },
          ],
        ],
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else if (this.reportMode == 'ncBills') {
      autoTable(doc, {
        body: [
          [
            { content: 'Total Bills', styles: { halign: 'left' } },
            { content: this.ncBills.length, styles: { halign: 'right' } },
          ],
          [
            { content: 'Total Amount', styles: { halign: 'left' } },
            {
              content: this.ncBills.reduce(
                (acc, res) => acc + res.billing.grandTotal,
                0,
              ),
              styles: { halign: 'right' },
            },
          ],
        ],
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else if (this.reportMode == 'takeawayBills') {
      autoTable(doc, {
        body: [
          [
            { content: 'Total Bills', styles: { halign: 'left' } },
            { content: this.takeawayBills.length, styles: { halign: 'right' } },
          ],
          [
            { content: 'Total Amount', styles: { halign: 'left' } },
            {
              content: this.takeawayBills.reduce(
                (acc, res) => acc + res.billing.grandTotal,
                0,
              ),
              styles: { halign: 'right' },
            },
          ],
        ],
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else if (this.reportMode == 'onlineBills') {
      autoTable(doc, {
        body: [
          [
            { content: 'Total Bills', styles: { halign: 'left' } },
            { content: this.onlineBills.length, styles: { halign: 'right' } },
          ],
          [
            { content: 'Total Amount', styles: { halign: 'left' } },
            {
              content: this.onlineBills.reduce(
                (acc, res) => acc + res.billing.grandTotal,
                0,
              ),
              styles: { halign: 'right' },
            },
          ],
        ],
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    } else if (this.reportMode == 'takeawayTokenWise') {
      autoTable(doc, {
        body: [
          [
            { content: 'Total Bills', styles: { halign: 'left' } },
            {
              content: this.tokenWiseBills.length,
              styles: { halign: 'right' },
            },
          ],
          [
            { content: 'Total Amount', styles: { halign: 'left' } },
            {
              content: this.tokenWiseBills.reduce(
                (acc, res) => acc + res.billing.grandTotal,
                0,
              ),
              styles: { halign: 'right' },
            },
          ],
        ],
        startY: y + 10,
        didDrawPage: function (data) {
          y = data.cursor.y;
        },
      });
    }
    doc.save(this.reportMode + new Date().toLocaleString() + '.pdf');
  }

  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  export() {
    const doc = new jsPDF();
    autoTable(doc, { html: '#my-table' });
  }

  spaceOut(text: string) {
    return text.replace(/([A-Z])/g, ' $1').trim();
  }

  ngAfterViewInit(): void {
    const ctx = document.getElementById('myChart');
    this.salesChartJS = new Chart(this.salesChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    this.paymentChartJS = new Chart(this.orderChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Method'],
        datasets: [
          {
            label: 'Payment Received',
            data: [],
            borderWidth: 1,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // report functions

  openReport(
    stage:
      | 'billWise'
      | 'kotWise'
      | 'itemWise'
      | 'discounted'
      | 'ncBills'
      | 'takeawayBills'
      | 'onlineBills'
      | 'daySummary'
      | 'consolidated'
      | 'takeawayTokenWise'
      | 'onlineTokenWise'
      | 'tableWise'
      | 'billEdits'
      | 'customerWiseReport'
      | 'dineInBills'
      | 'hourlyItemSales'
      | 'kotEdits'
      | 'paymentWise'
      | 'waiterWiseItems'
      | 'tableWiseSales'
      | 'tableWiseActivity',
  ) {
    const dialog = this.dialog.open(ReportViewComponent, {
      data: { stage: stage, data: {} },
    });
    dialog.closed.subscribe((res) => {
      console.log('Closed', res);
    });
  }
}
interface ReportFormat {
  title: string;
  code:'billWise'
  | 'kotWise'
  | 'itemWise'
  | 'discounted'
  | 'ncBills'
  | 'takeawayBills'
  | 'onlineBills'
  | 'daySummary'
  | 'consolidated'
  | 'takeawayTokenWise'
  | 'onlineTokenWise'
  | 'tableWise'
  | 'billEdits'
  | 'customerWiseReport'
  | 'dineInBills'
  | 'hourlyItemSales'
  | 'kotEdits'
  | 'paymentWise'
  | 'waiterWiseItems'
  | 'tableWiseSales'
  | 'tableWiseActivity';
  description: string;
}