import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Product } from '../../../../../types/product.structure';
import { Category } from '../../../../../types/category.structure';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss']
})
export class OptionComponent implements AfterViewInit {
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() category:Category|undefined;
  options:Product[] = []
  @ViewChild('optionsComponent',{static:false}) optionsComponent: ElementRef|undefined;
  ngAfterViewInit(){
    if(this.category){
      this.options = this.category.products
    }
    console.log("Options", this.optionsComponent);
    
    if(this.optionsComponent){
      console.log("Changing position", this.optionsComponent, this.x, this.y);
      this.optionsComponent.nativeElement.style.top = this.y + "px";
      this.optionsComponent.nativeElement.style.left = this.x + "px";
    }
  }
}
