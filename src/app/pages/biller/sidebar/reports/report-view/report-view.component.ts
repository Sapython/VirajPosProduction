import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-report-view',
  templateUrl: './report-view.component.html',
  styleUrls: ['./report-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReportViewComponent implements AfterViewInit {
  loading: boolean = false;
  today:Date = new Date();
  constructor(
    @Inject(DIALOG_DATA)
    public dialogData: {
      stage:'billWise'
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
      | 'comboSales'
      | 'billSplits'
      | 'cancelledBills'
      | 'settledBills'
      | 'tableWiseActivity';
      data: any;
    },
    public reportService: ReportService,
    public dialogRef:DialogRef
  ) {}

  noFuture = (d: Date | null): boolean => {
    const today = new Date();
    return d!.valueOf() < today.valueOf();
  };

  ngAfterViewInit(): void {
    console.log(
      "document.getElementById('reportTable')",
      document.getElementById('reportTable'),
    );
  }

  change(){
    console.log("changed");
    this.reportService.refetchConsolidated.next()
  }

  get getDate() {
    // if start date and end date is same as today then return today or else return date in this format From: date1 to date2
    const today = new Date();
    if (
      this.reportService.dateRangeFormGroup.value.startDate.getDate() === today.getDate() &&
      this.reportService.dateRangeFormGroup.value.endDate.getDate() === today.getDate()
    ) {
      return 'Today';
    }
    return `From: ${this.reportService.dateRangeFormGroup.value.startDate.toLocaleDateString()} to ${this.reportService.dateRangeFormGroup.value.endDate.toLocaleDateString()}`;
  }

}
