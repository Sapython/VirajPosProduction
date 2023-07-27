import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BillService } from '../../../../../../../core/services/database/bill/bill.service';
import { BillConstructor } from '../../../../../../../types/bill.structure';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-report-view',
  templateUrl: './report-view.component.html',
  styleUrls: ['./report-view.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class ReportViewComponent {
  loading:boolean = false;
  constructor(
  @Inject(DIALOG_DATA) public dialogData:{
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
    | 'waiterWiseItems',
    data:any
  },
  public reportService:ReportService
  ) {

  }


}

