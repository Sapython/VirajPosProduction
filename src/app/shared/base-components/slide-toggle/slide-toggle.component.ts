import { AfterContentInit, Component, ContentChild, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import { SlideButtonDirective } from './slide-button.directive';

@Component({
  selector: 'viraj-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss']
})
export class SlideToggleComponent implements AfterContentInit{
  @ContentChildren(SlideButtonDirective) buttonList: QueryList<SlideButtonDirective> | undefined;
  ngAfterContentInit() {
    console.log("this.element",this.buttonList);
    
  }
}
