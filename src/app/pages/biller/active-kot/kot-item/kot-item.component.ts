import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { LineCancelComponent } from './line-cancel/line-cancel.component';
import { LineDiscountComponent } from './line-discount/line-discount.component';
import { Timestamp } from '@angular/fire/firestore';
import { PromptComponent } from '../../../../shared/base-components/prompt/prompt.component';
import { firstValueFrom } from 'rxjs';
import { Product } from '../../../../types/product.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import {
  DirectFlatDiscount,
  DirectPercentDiscount,
} from '../../../../types/discount.structure';
import { BillService } from '../../../../core/services/database/bill/bill.service';
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
  @Input() disabled: boolean = false;
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() lineCancelled: EventEmitter<any> = new EventEmitter();
  @Output() lineDiscounted: EventEmitter<any> = new EventEmitter();
  @Input() propagateFunctions: boolean = false;
  @Output() addQuantityFunction: EventEmitter<void> = new EventEmitter<void>();
  @Output() removeQuantityFunction: EventEmitter<void> =
    new EventEmitter<void>();
  @Output() setQuantityFunction: EventEmitter<number> =
    new EventEmitter<number>();

  @ViewChild('amountInput') amountInput: ElementRef;
  
  showKotNo: boolean = false;
  constructor(
    public dataProvider: DataProvider,
    private dialog: Dialog,
    private billService: BillService,
  ) {}
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
    const dialog = this.dialog.open(PromptComponent, {
      data: {
        title: 'Enter a instruction',
        placeholder: 'Instruction',
        value: this.info,
        type: 'text',
        required: false,
        description: 'Enter a instruction for the kitchen',
      },
    });
    let res = await firstValueFrom(dialog.closed);
    //  console.log("res",res);
    if (typeof res == 'string') {
      this.info = res;
      this.product!.instruction = this.info;
    } else {
      delete this.product!.instruction;
      return;
    }
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
        let formData: {
          type: 'percentage' | 'flat';
          value: number;
          reason: string;
        } = data;
        if (formData.type == 'percentage') {
          let discount: DirectPercentDiscount = {
            mode: data.type,
            reason: data.reason,
            creationDate: Timestamp.now(),
            value: data.value,
            totalAppliedDiscount: 0,
          };
          this.product.lineDiscount = discount;
          this.billService.addActivity(this.dataProvider.currentBill, {
            type: 'lineDiscounted',
            message: `Line Discounted by ${data.value}% for ${this.product.name} by ${this.dataProvider.currentUser?.username}`,
            user: this.dataProvider.currentBusinessUser.username,
            data: this.product,
          });
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
  increase() {
    if (!this.propagateFunctions) {
      this.product.quantity = this.product.quantity + 1;
      this.dataProvider.currentBill?.calculateBill();
    } else {
      console.log('Adding through', this.addQuantityFunction);
      this.addQuantityFunction.emit();
    }
  }
  decrease() {
    if (this.product.quantity > 1){
      if (!this.propagateFunctions) {
        this.product.quantity = this.product.quantity - 1;
        this.dataProvider.currentBill?.calculateBill();
      } else {
        this.removeQuantityFunction.emit();
      }
    }
  }

  setQuantity(quantityValue) {
    console.log("quantityValue",quantityValue);
    if (!this.propagateFunctions) {
      this.product.quantity = quantityValue;
      this.dataProvider.currentBill?.calculateBill();
    } else {
      this.setQuantityFunction.emit(quantityValue);
    }
  }

  setAmount(amountValue:number|string){
    amountValue = Number(amountValue);
    if (isNaN(amountValue)) {
      amountValue = 0;
    }
    this.product.quantity = this.roundOff(amountValue/this.product.price);
    if (!this.propagateFunctions) {
      this.dataProvider.currentBill?.calculateBill();
    } else {
      this.setQuantityFunction.emit(amountValue);
    }
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

  roundOff(number:number){
    // round off number to last 2 digits
    // use the number.epsilon
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  setAmountInput(){
    setTimeout(() => {
      console.log('this.amountInput',this.amountInput);
      if (this.amountInput){
        this.amountInput.nativeElement.value = (this.product.quantity * this.product.price).toString();
      }
    },200)
  }
}
export interface Config {
  name: string;
  price: number;
}
