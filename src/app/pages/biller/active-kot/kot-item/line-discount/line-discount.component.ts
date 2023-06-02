import { Component, Inject } from '@angular/core';
import { zoomOutOnLeaveAnimation, shakeOnEnterAnimation } from 'angular-animations';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { DialogComponent } from '../../../../../shared/base-components/dialog/dialog.component';
import { Product } from '../../../../../types/product.structure';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
@Component({
  selector: 'app-line-discount',
  templateUrl: './line-discount.component.html',
  styleUrls: ['./line-discount.component.scss'],
  animations:[zoomOutOnLeaveAnimation(),
    shakeOnEnterAnimation({duration:500})]
})
export class LineDiscountComponent {
  value:number = 0;
  mode:'directPercent'|'directFlat' = 'directPercent';
  reason:string = '';
  password:string = '';
  constructor(@Inject(DIALOG_DATA) public product:Product,public dialogRef:DialogRef,private dialog:Dialog,private dataProvider:DataProvider){}
  async submit(){
    if ((await this.dataProvider.checkPassword(this.password))){
      this.dialogRef.close({type:this.mode,value:this.value,reason:this.reason})
    } else {
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Wrong Password',description:'Please enter the correct password to continue.'}})
    }
  }
}
