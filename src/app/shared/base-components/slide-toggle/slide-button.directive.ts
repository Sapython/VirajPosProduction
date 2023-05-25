import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[virajSlideButton]'
})
export class SlideButtonDirective {
  constructor(public readonly template: TemplateRef<any>) { }

  @Input('value') value: string = "";
}
