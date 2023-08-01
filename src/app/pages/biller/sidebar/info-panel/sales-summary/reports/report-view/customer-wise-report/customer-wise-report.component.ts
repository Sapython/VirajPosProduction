import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-customer-wise-report',
  templateUrl: './customer-wise-report.component.html',
  styleUrls: ['./customer-wise-report.component.scss'],
})
export class CustomerWiseReportComponent {
  @Input() customerWiseReport: any[] = [];
  @Input() loading: boolean = true;
}
