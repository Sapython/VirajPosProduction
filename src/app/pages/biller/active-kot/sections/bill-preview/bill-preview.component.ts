import { Component, Input } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';
import { PrintableBill } from '../../../../../types/bill.structure';

@Component({
  selector: 'app-bill-preview',
  templateUrl: './bill-preview.component.html',
  styleUrls: ['./bill-preview.component.scss'],
  animations:[zoomInOnEnterAnimation({duration:300}),
    zoomOutOnLeaveAnimation({duration:300}),]
})
export class BillPreviewComponent {
  @Input() printableBillData:PrintableBill;
}
