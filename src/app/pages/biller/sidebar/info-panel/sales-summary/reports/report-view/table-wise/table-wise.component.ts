import { Component, Input } from '@angular/core';
import { kotReport } from '../../../../../../../../types/kot.structure';

@Component({
  selector: 'app-table-wise',
  templateUrl: './table-wise.component.html',
  styleUrls: ['./table-wise.component.scss']
})
export class TableWiseComponent {
  @Input() kots: kotReport[] = [];
  @Input() loading:boolean = false;
}
