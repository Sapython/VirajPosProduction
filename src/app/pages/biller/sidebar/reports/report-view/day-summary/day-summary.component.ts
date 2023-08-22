import { Component } from '@angular/core';
import { Subscription, ReplaySubject } from 'rxjs';
import { BillConstructor } from '../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../types/kot.structure';
import { ReportService } from '../../report.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-day-summary',
  templateUrl: './day-summary.component.html',
  styleUrls: ['./day-summary.component.scss'],
})
export class DaySummaryComponent {
  channelWiseDaySummary = {
    all: {
      totalBills: 0,
      netSales:0,
      totalAmount: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalKots: 0,
      totalProducts: 0,
      totalDiscountedBills: 0,
      totalNcBills: 0,
      totalNcAmount: 0,
      paymentChannels:{}
    },
    dineIn: {
      totalBills: 0,
      netSales:0,
      totalAmount: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalKots: 0,
      totalProducts: 0,
      totalDiscountedBills: 0,
      totalNcBills: 0,
      totalNcAmount: 0,
      paymentChannels:{}
    },
    takeaway: {
      totalBills: 0,
      netSales:0,
      totalAmount: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalKots: 0,
      totalProducts: 0,
      totalDiscountedBills: 0,
      totalNcBills: 0,
      totalNcAmount: 0,
      paymentChannels:{}
    },
    online: {
      totalBills: 0,
      netSales:0,
      totalAmount: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalKots: 0,
      totalProducts: 0,
      totalDiscountedBills: 0,
      totalNcBills: 0,
      totalNcAmount: 0,
      paymentChannels:{}
    },
  };
  downloadPDfSubscription: Subscription = Subscription.EMPTY;
  downloadExcelSubscription: Subscription = Subscription.EMPTY;
  reportChangedSubscription: Subscription = Subscription.EMPTY;
  loading: boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(
    private reportService: ReportService,
    private dataProvider: DataProvider,
  ) {
    this.reportService.refetchConsolidated.subscribe(() => {
      console.log('Refetching consolidated');
      this.ngOnInit();
    });
  }

  ngOnInit(): void {
    this.reportChangedSubscription.unsubscribe();
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
            let dineInBills = bills.filter((res) => res.mode == 'dineIn');
            let takeawayBills = bills.filter((res) => res.mode == 'takeaway');
            let onlineBills = bills.filter((res) => res.mode == 'online');
            // this.daySummary = {
            //   totalBills: bills.length,
            //   totalAmount: bills.reduce(
            //     (acc, res) => acc + res.billing.grandTotal,
            //     0,
            //   ),
            //   totalDiscount: bills.reduce(
            //     (acc, res) =>
            //       acc +
            //       res.billing.discount.reduce(
            //         (a, b) => a + (b.totalAppliedDiscount || 0),
            //         0,
            //       ),
            //     0,
            //   ),
            //   totalTax: bills.reduce(
            //     (acc, res) => acc + res.billing.totalTax,
            //     0,
            //   ),
            //   totalKots: bills
            //     .map((res) => res.kots.length)
            //     .reduce((a, b) => a + b, 0),
            //   totalProducts: bills
            //     .map((res) =>
            //       res.kots
            //         .map((res) => res.products.length)
            //         .reduce((a, b) => a + b, 0),
            //     )
            //     .reduce((a, b) => a + b, 0),
            //   totalDiscountedBills: bills.filter(
            //     (res) => res.billing.discount.length > 0,
            //   ).length,
            //   totalDiscountedAmount: bills
            //     .filter((res) => res.billing.discount.length > 0)
            //     .reduce((acc, res) => acc + res.billing.grandTotal, 0),
            //   totalNcBills: bills.filter((res) => res.nonChargeableDetail)
            //     .length,
            //   totalNcAmount: bills
            //     .filter((res) => res.nonChargeableDetail)
            //     .reduce((acc, res) => acc + res.billing.grandTotal, 0),
            //   totalTakeawayBills: bills.filter((res) => res.mode == 'takeaway')
            //     .length,
            //   totalTakeawayAmount: bills
            //     .filter((res) => res.mode == 'takeaway')
            //     .reduce((acc, res) => acc + res.billing.grandTotal, 0),
            //   totalOnlineBills: bills.filter((res) => res.mode == 'online')
            //     .length,
            //   totalOnlineAmount: bills
            //     .filter((res) => res.mode == 'online')
            //     .reduce((acc, res) => acc + res.billing.grandTotal, 0),
            // };
            this.channelWiseDaySummary = {
              all: {
                totalBills: bills.length,
                totalAmount: this.roundOff(bills.reduce(
                  (acc, res) => acc + res.billing.grandTotal,
                  0,
                )),
                netSales: this.roundOff(bills.reduce(
                  (acc, res) => acc + res.billing.subTotal,
                  0,
                ) - bills.reduce(
                  (acc, res) => acc + res.billing.taxes.reduce((a, b) => a + b.amount, 0),
                  0,
                )),
                totalDiscount: this.roundOff(bills.reduce(
                  (acc, res) =>
                    acc +
                    res.billing.discount.reduce(
                      (a, b) => a + (b.totalAppliedDiscount || 0),
                      0,
                    ),
                  0,
                )),
                totalTax: this.roundOff(bills.reduce(
                  (acc, res) => acc + res.billing.taxes.reduce((a, b) => a + b.amount, 0),
                  0,
                )),
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
                totalNcBills: bills.filter((res) => res.nonChargeableDetail)
                  .length,
                totalNcAmount: this.roundOff(bills
                  .filter((res) => res.nonChargeableDetail)
                  .reduce((acc, res) => acc + res.billing.subTotal, 0)),
                paymentChannels: bills.reduce((acc, res) => {
                  if (res.settlement?.payments){
                    res.settlement.payments.forEach((payment) => {
                      if (acc && acc[payment.paymentMethod]) {
                        acc[payment.paymentMethod] += payment.amount;
                      } else {
                        if (!acc){
                          acc = {[payment.paymentMethod]:0}
                        }
                        acc[payment.paymentMethod] = payment.amount;
                      }
                    })
                  }
                },{} as any)
              },
              dineIn: {
                totalBills: dineInBills.length,
                totalAmount: this.roundOff(dineInBills.reduce(
                  (acc, res) => acc + res.billing.grandTotal,
                  0,
                )),
                netSales: this.roundOff(dineInBills.reduce(
                  (acc, res) => acc + res.billing.subTotal,
                  0,
                )- dineInBills.reduce(
                  (acc, res) => acc + res.billing.taxes.reduce((a, b) => a + b.amount, 0),
                  0,
                )),
                totalDiscount: this.roundOff(dineInBills.reduce(
                  (acc, res) =>
                    acc +
                    res.billing.discount.reduce(
                      (a, b) => a + (b.totalAppliedDiscount || 0),
                      0,
                    ),
                  0,
                )),
                totalTax: this.roundOff(dineInBills.reduce(
                  (acc, res) => acc + res.billing.taxes.reduce((a, b) => a + b.amount, 0),
                  0,
                )),
                totalKots: dineInBills
                  .map((res) => res.kots.length)
                  .reduce((a, b) => a + b, 0),
                totalProducts: dineInBills
                  .map((res) =>
                    res.kots
                      .map((res) => res.products.length)
                      .reduce((a, b) => a + b, 0),
                  )
                  .reduce((a, b) => a + b, 0),
                totalDiscountedBills: dineInBills.filter(
                  (res) => res.billing.discount.length > 0,
                ).length,
                totalNcBills: dineInBills.filter(
                  (res) => res.nonChargeableDetail,
                ).length,
                totalNcAmount: this.roundOff(dineInBills
                  .filter((res) => res.nonChargeableDetail)
                  .reduce((acc, res) => acc + res.billing.subTotal, 0)),
                paymentChannels: dineInBills.reduce((acc, res) => {
                  if (res.settlement?.payments){
                    res.settlement.payments.forEach((payment) => {
                      if (acc && acc[payment.paymentMethod]) {
                        acc[payment.paymentMethod] += payment.amount;
                      } else {
                        if (!acc){
                          acc = {[payment.paymentMethod]:0}
                        }
                        acc[payment.paymentMethod] = payment.amount;
                      }
                    })
                  }
                },{} as any)
              },
              takeaway: {
                totalBills: takeawayBills.length,
                totalAmount: this.roundOff(takeawayBills.reduce(
                  (acc, res) => acc + res.billing.grandTotal,
                  0)),
                netSales: this.roundOff(takeawayBills.reduce(
                  (acc, res) => acc + res.billing.subTotal,
                  0) - takeawayBills.reduce(
                    (acc, res) => acc + res.billing.taxes.reduce((a, b) => a + b.amount, 0),
                    0,
                  )),
                totalDiscount: this.roundOff(takeawayBills.reduce(
                  (acc, res) =>
                    acc +
                    res.billing.discount.reduce(
                      (a, b) => a + (b.totalAppliedDiscount || 0),
                      0,
                    ),
                  0,
                )),
                totalTax: this.roundOff(takeawayBills.reduce(
                  (acc, res) => acc + res.billing.taxes.reduce((a, b) => a + b.amount, 0),
                  0,
                )),
                totalKots: takeawayBills
                  .map((res) => res.kots.length)
                  .reduce((a, b) => a + b, 0),
                totalProducts: takeawayBills
                  .map((res) =>
                    res.kots
                      .map((res) => res.products.length)
                      .reduce((a, b) => a + b, 0),
                  )
                  .reduce((a, b) => a + b, 0),
                totalDiscountedBills: takeawayBills.filter(
                  (res) => res.billing.discount.length > 0,
                ).length,
                totalNcBills: takeawayBills.filter(
                  (res) => res.nonChargeableDetail,
                ).length,
                totalNcAmount: this.roundOff(takeawayBills
                  .filter((res) => res.nonChargeableDetail)
                  .reduce((acc, res) => acc + res.billing.subTotal, 0)),
                  paymentChannels: takeawayBills.reduce((acc, res) => {
                    if (res.settlement?.payments){
                      res.settlement.payments.forEach((payment) => {
                        if (acc && acc[payment.paymentMethod]) {
                          acc[payment.paymentMethod] += payment.amount;
                        } else {
                          if (!acc){
                            acc = {[payment.paymentMethod]:0}
                          }
                          acc[payment.paymentMethod] = payment.amount;
                        }
                      })
                    }
                  },{} as any)
              },
              online: {
                totalBills: onlineBills.length,
                totalAmount: this.roundOff(onlineBills.reduce(
                  (acc, res) => acc + res.billing.grandTotal,
                  0,
                )),
                netSales: this.roundOff(onlineBills.reduce(
                  (acc, res) => acc + res.billing.subTotal,
                  0,
                ) - onlineBills.reduce(
                  (acc, res) => acc + res.billing.taxes.reduce((a, b) => a + b.amount, 0),
                  0,
                )),
                totalDiscount: this.roundOff(onlineBills.reduce(
                  (acc, res) =>
                    acc +
                    res.billing.discount.reduce(
                      (a, b) => a + (b.totalAppliedDiscount || 0),
                      0,
                    ),
                  0,
                )),
                totalTax: this.roundOff(onlineBills.reduce(
                  (acc, res) => acc + res.billing.taxes.reduce((a, b) => a + b.amount, 0),
                  0,
                )),
                totalKots: onlineBills
                  .map((res) => res.kots.length)
                  .reduce((a, b) => a + b, 0),
                totalProducts: onlineBills
                  .map((res) =>
                    res.kots
                      .map((res) => res.products.length)
                      .reduce((a, b) => a + b, 0),
                  )
                  .reduce((a, b) => a + b, 0),
                totalDiscountedBills: onlineBills.filter(
                  (res) => res.billing.discount.length > 0,
                ).length,
                totalNcBills: onlineBills.filter(
                  (res) => res.nonChargeableDetail,
                ).length,
                totalNcAmount: this.roundOff(onlineBills
                  .filter((res) => res.nonChargeableDetail)
                  .reduce((acc, res) => acc + res.billing.subTotal, 0)),
                  paymentChannels: onlineBills.reduce((acc, res) => {
                    if (res.settlement?.payments){
                      res.settlement.payments.forEach((payment) => {
                        if (acc && acc[payment.paymentMethod]) {
                          acc[payment.paymentMethod] += payment.amount;
                        } else {
                          if (!acc){
                            acc = {[payment.paymentMethod]:0}
                          }
                          acc[payment.paymentMethod] = payment.amount;
                        }
                      })
                    }
                  },{} as any)
              },
            };
          })
          .catch((err) => {
            this.loading = false;
            console.log('Error in getting bills', err);
          });
      },
    );
  }

  roundOff(num: number) {
    // use epsilon to 2 digits
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  async downloadPdf() {
    const doc = new jsPDF();
    let title = 'Day Summary Report';
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
    doc.save('Day Summary Report' + new Date().toLocaleString() + '.pdf');
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
      'day_summary' + new Date().toLocaleString() + '.csv';
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
