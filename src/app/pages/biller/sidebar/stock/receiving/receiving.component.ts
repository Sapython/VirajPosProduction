import { Component, Input } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.component.html',
  styleUrls: ['./receiving.component.scss'],
})
export class ReceivingComponent {
  @Input() approved: number = 40;
  @Input() pending: number = 40;
  constructor(public dataProvider: DataProvider) {}
}
