import { Component, Input } from '@angular/core';
import { BillerCounter } from '../../../biller/settings/sections/counters/counters.component';

@Component({
  selector: 'app-counter-card',
  templateUrl: './counter-card.component.html',
  styleUrls: ['./counter-card.component.scss']
})
export class CounterCardComponent {
  @Input() counter:BillerCounter|undefined;
}
