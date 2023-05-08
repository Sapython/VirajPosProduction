import { Component, Input } from '@angular/core';
import { DataProvider } from 'src/app/provider/data-provider.service';

@Component({
  selector: 'app-dispersion',
  templateUrl: './dispersion.component.html',
  styleUrls: ['./dispersion.component.scss']
})
export class DispersionComponent {
  @Input() approved:number = 40;
  @Input() pending:number = 40;
  constructor(public dataProvider:DataProvider) { }
}
