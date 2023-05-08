import { Component, Inject } from '@angular/core';
import { zoomOutOnLeaveAnimation, shakeOnEnterAnimation } from 'angular-animations';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { Product } from 'src/app/biller/constructors';
import { DialogComponent } from 'src/app/base-components/dialog/dialog.component';
import { DataProvider } from 'src/app/provider/data-provider.service';
@Component({
  selector: 'app-line-discount',
  templateUrl: './line-discount.component.html',
  styleUrls: ['./line-discount.component.scss'],
  animations:[zoomOutOnLeaveAnimation(),
    shakeOnEnterAnimation({duration:500})]
})
export class LineDiscountComponent {
  value:number = 0;
  type:'percentage'|'amount' = 'percentage';
  reason:string = '';
  password:string = '';
  constructor(@Inject(DIALOG_DATA) public product:Product,public dialogRef:DialogRef,private dialog:Dialog,private dataProvider:DataProvider){}
  submit(){
    if (this.password == this.dataProvider.password){
      this.dialogRef.close({type:this.type,value:this.value,reason:this.reason})
    } else {
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Wrong Password',description:'Please enter the correct password to continue.'}})
    }
  }
}
