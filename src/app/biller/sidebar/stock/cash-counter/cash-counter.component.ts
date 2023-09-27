import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cash-counter',
  templateUrl: './cash-counter.component.html',
  styleUrls: ['./cash-counter.component.scss']
})
export class CashCounterComponent {
  @Input() totalSale:number = 0;
  @Input() cashLeft:number = 0;
  @Input() totalDispensedMoney:number = 0;
  @Input() totalNonChargeable:number = 0;
  @Input() totalOnlinePayment:number = 0;
  @Output() close:EventEmitter<boolean> = new EventEmitter<boolean>();
}
