import { Component, Input } from '@angular/core';
import { kotReport } from '../../../../../../../../types/kot.structure';

@Component({
  selector: 'app-kot-edits',
  templateUrl: './kot-edits.component.html',
  styleUrls: ['./kot-edits.component.scss']
})
export class KotEditsComponent {
  @Input() kots: kotReport[] = [];
  @Input() loading:boolean = false;
}
