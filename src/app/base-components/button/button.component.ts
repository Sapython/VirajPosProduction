import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'viraj-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() type:'solid' | 'outline' | 'icon' = 'solid';
  @Input() animated:boolean = false;
  @Input() small:boolean = false;
  @Input() large:boolean = false;
  @Input() extraLarge:boolean = false;
  @Input() disabled:boolean = false;
  @Input() minimalPadding:boolean = false;
  @Input() iconSize:'small' | 'medium' | 'large' = 'medium';
  @Input() noPropogation:boolean = false;
  @Output() vclick: EventEmitter<any> = new EventEmitter();

  filterClick(event){
    if(this.noPropogation){
      event.stopPropagation();
    }
    this.vclick.emit();
  }

}
