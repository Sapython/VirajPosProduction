import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'viraj-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements AfterViewInit {
@Input() type: 'solid' | 'outline' | 'icon' = 'solid';
  @Input() animated: boolean = false;
  @Input() small: boolean = false;
  @Input() large: boolean = false;
  @Input() extraLarge: boolean = false;
  @Input() disabled: boolean = false;
  @Input() minimalPadding: boolean = false;
  @Input() iconSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() noPropogation: boolean = false;
  @Input() color: 'primary'|'success'|'warning'|'danger' = 'primary';
  @Output() vclick: EventEmitter<any> = new EventEmitter();
  @ViewChild('button') button:ElementRef;
  constructor(){
  }
  filterClick(event) {
    if (this.noPropogation) {
      if(event.stopPropagation){
        event.stopPropagation();
      }
    }
    this.vclick.emit();
  }

  ngAfterViewInit(): void {
    var hammertime = new Hammer(this.button.nativeElement);
    hammertime.on('panend', (ev)=>{
      this.filterClick(ev);
    });
  }
}
