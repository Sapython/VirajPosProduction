import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Discount } from '../../settings/settings.component';
import { Timestamp } from '@angular/fire/firestore';
import { DataProvider } from '../../../provider/data-provider.service';
import { DialogComponent } from '../../../base-components/dialog/dialog.component';

@Component({
  selector: 'app-add-discount',
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.scss']
})
export class AddDiscountComponent {
  mode:'codeBased'|'directPercent'|'directFlat'='directPercent';
  discountForm:FormGroup = new FormGroup({
    mode:new FormControl('directPercent'),
    percent:new FormControl(0),
    selectDiscount:new FormControl(''),
    amount:new FormControl(0),
    password:new FormControl('',Validators.required),
    reason:new FormControl('',Validators.required),
  });
  discounts:Discount[] = []
  constructor(private dialogRef:MatDialogRef<AddDiscountComponent>,public dataProvider:DataProvider,private dialog:Dialog) {
    // this.discountForm.get('code')?.valueChanges.pipe(debounceTime(600)).subscribe((value)=>{
    //   // this.mode = value;
    //   if (value === 'DISCOUNT20'){
    //     this.discountForm.get('percent')?.setValue(20);
    //   } else {
    //     this.discountForm.get('percent')?.setValue(0);
    //   }
    // })
  }

  // isValidDiscount(discount:Discount){
  //   discount.accessLevels.includes((this.dataProvider.currentBusiness!.users || []).find((a)=>{
  //     a.email == this.dataProvider.currentUser?.email
  //   }))
  // }

  submit(){
    if(this.discountForm.value.password != this.dataProvider.password){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Invalid Password',description:'Please enter the correct password to continue.',buttons:['Ok'],primary:[0]}})
      return;
    }
    console.log(this.discountForm.value);
    if (this.discountForm.value.mode == 'codeBased'){
      this.dialogRef.close({discount:this.discountForm.value.selectDiscount,discounted:true})
    } else if (this.discountForm.value.mode == 'directPercent'){
      let discount:Discount = {
        type:'percentage',
        id:Math.random().toString(36).substr(2, 9),
        name:'Direct Discount',
        value:this.discountForm.value.percent,
        totalAppliedDiscount:0,
        accessLevels:['admin'],
        creationDate:Timestamp.now(),
      }
      this.dialogRef.close({discount,discounted:true})
    } else if (this.discountForm.value.mode == 'directFlat'){
      let discount:Discount = {
        type:'amount',
        id:Math.random().toString(36).substr(2, 9),
        name:'Direct Discount',
        value:this.discountForm.value.amount,
        totalAppliedDiscount:0,
        accessLevels:['admin'],
        creationDate:Timestamp.now(),
      }
      this.dialogRef.close({discount,discounted:true})
    } else {
      this.dialogRef.close({discounted:false})
    }
  }

  cancel(){
    this.dialogRef.close();
  }
}
