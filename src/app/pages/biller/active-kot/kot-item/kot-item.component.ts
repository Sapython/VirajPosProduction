import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { LineCancelComponent } from './line-cancel/line-cancel.component';
import { LineDiscountComponent } from './line-discount/line-discount.component';
import { Timestamp } from '@angular/fire/firestore';
import { PromptComponent } from '../../../../shared/base-components/prompt/prompt.component';
import { firstValueFrom } from 'rxjs';
import { Product } from '../../../../types/product.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { DirectFlatDiscount, DirectPercentDiscount } from '../../../../types/discount.structure';
@Component({
  selector: 'app-kot-item',
  templateUrl: './kot-item.component.html',
  styleUrls: ['./kot-item.component.scss'],
})
export class KotItemComponent implements OnChanges {
  @Input() productName: string = 'Loading';
  @Input() nonVeg: boolean = false;
  @Input() editMode: boolean = false;
  @Input() price: number = 0;
  @Input() quantity: number = 1;
  @Input() kotNo: number = 0;
  @Input() kotId: string = '';
  @Input() info: string | null = null;
  @Input() variations: Config[] = [];
  @Input() product: Product | undefined;
  @Input() manageKot: boolean = false;
  @Input() cancelled: boolean = false;
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() lineCancelled: EventEmitter<any> = new EventEmitter();
  @Output() lineDiscounted: EventEmitter<any> = new EventEmitter();
  showKotNo: boolean = false;
  constructor(public dataProvider: DataProvider, private dialog: Dialog) {}
  kotNoColors: { color: string; contrast: string }[] = [
    { color: '#4dc9f6', contrast: '#000000' },
    { color: '#f67019', contrast: '#000000' },
    { color: '#f53794', contrast: '#000000' },
    { color: '#537bc4', contrast: '#000000' },
    { color: '#acc236', contrast: '#000000' },
    { color: '#166a8f', contrast: '#000000' },
    { color: '#00a950', contrast: '#000000' },
    { color: '#58595b', contrast: '#000000' },
    { color: '#8549ba', contrast: '#000000' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
  //  console.log('quantity', this.quantity);
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
  //  console.log(changes);
  }

  async setInfo() {
  //  console.log("this.info",this.info);
    const dialog = this.dialog.open(PromptComponent,{data:{title:'Enter a instruction',placeholder:'Instruction',value:this.info,type:'text',required:false,description:'Enter a instruction for the kitchen'}})
    let res = await firstValueFrom(dialog.closed)
  //  console.log("res",res);
    if (typeof(res) == 'string'){
      this.info = res
      this.product!.instruction = this.info;
    } else {
      delete this.product!.instruction;
      return
    };
  }
  invertHex(hex: string) {
    hex.replace('#', '');
  //  console.log('hex', hex);
    let a = (Number(`0x1${hex}`) ^ 0xffffff)
      .toString(16)
      .substr(1)
      .toUpperCase();
  //  console.log('a', a);
    return a;
  }
  lineCancel() {
    const dialog = this.dialog.open(LineCancelComponent, {
      data: this.product,
    });
    dialog.closed.subscribe((data) => {
      if (data) {
        this.lineCancelled.emit(data);
      }
    });
  }
  lineDiscount() {
    const dialog = this.dialog.open(LineDiscountComponent, {
      data: this.product,
    });
    dialog.closed.subscribe((data: any) => {
    //  console.log('Discount', data);
      if (data && this.product) {
        let formData: { type: 'percentage' | 'flat'; value: number,reason:string } = data;
        if (formData.type == 'percentage') {
          let discount: DirectPercentDiscount = {
            mode: data.type,
            reason: data.reason,
            creationDate: Timestamp.now(),
            value: data.value,
            totalAppliedDiscount: 0,
          };
          this.product.lineDiscount = discount;
          this.lineDiscounted.emit(discount);
        } else {
          let discount: DirectFlatDiscount = {
            mode: data.type,
            reason: data.reason,
            creationDate: Timestamp.now(),
            value: data.value,
            totalAppliedDiscount: 0,
          };
          this.product.lineDiscount = discount;
          this.lineDiscounted.emit(discount);
        }
      }
    });
  }
  increase(){
    this.product.quantity = this.product.quantity + 1;this.dataProvider.currentBill?.calculateBill()
  }
  decrease(){
    this.product.quantity = this.product.quantity - 1;this.dataProvider.currentBill?.calculateBill()
  }

  get isHalf() {
    if (this.product) {
      for (const tag of this.product.tags) {
        if (tag.name.toLocaleLowerCase() == 'half') {
          return true;
        }
      }
    } else {
      return false;
    }
  }
}
export interface Config {
  name: string;
  price: number;
}
