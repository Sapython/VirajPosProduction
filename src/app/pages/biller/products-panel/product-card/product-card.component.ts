import { Component, Input, OnInit } from '@angular/core';
import { Tax } from '../../../../types/tax.structure';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() productName: string = '';
  @Input() price: number = 0;
  @Input() smaller: boolean = false;
  @Input() category: string = '';
  @Input() veg: boolean = true;
  @Input() tags: { name: string, color: string,contrast:string}[] = [];
  @Input() taxes: Tax[] | undefined = undefined;
  ngOnInit(): void {
      // FIND ANY SPECIAL CHARACTERS like (/,-!@#$%^&*():"{]}\<>.?~`[=+-_) AND ADD SPACE BEFORE AND AFTER THEM TO BREAK THE WORDS ON WRAP 
    // THIS IS DONE TO AVOID THE WORDS FROM OVERFLOWING THE CARD
    // make a valid regex
    const regex = new RegExp(/(\(|\)|\/|\-|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\:|\"|\{|\}|\]|\[|\\|\<|\>|\?|\~|\`|\=|\+|\-|\_|\)|\(|\,)/g);
    // find all the matches
    const matches = this.productName.match(regex);
    // if there are matches
    if (matches) {
      // loop through the matches
      matches.forEach((match) => {
        // replace the match with a space before and after the match
        this.productName = this.productName.replace(match, ' ' + match + ' ');
      });
    }
    // THIS IS DONE BECAUSE THE WORDS ARE NOT BREAKING ON WRAP WHEN THERE ARE SPECIAL CHARACTERS IN THE WORDS
  }
}
