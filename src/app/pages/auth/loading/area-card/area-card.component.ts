import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-area-card',
  templateUrl: './area-card.component.html',
  styleUrls: ['./area-card.component.scss']
})
export class AreaCardComponent {
  @Input() areaName:string;
}
