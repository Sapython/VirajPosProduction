import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Timestamp } from '@angular/fire/firestore';
import { DialogComponent } from '../../../../shared/base-components/dialog/dialog.component';
import { CodeBaseDiscount, DirectFlatDiscount, DirectPercentDiscount } from '../../../../types/discount.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-add-discount',
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.scss']
})
export class AddDiscountComponent implements OnInit {
  mode:'codeBased'|'directPercent'|'directFlat'='directPercent';
  currentDiscount:CodeBaseDiscount|DirectFlatDiscount|DirectPercentDiscount|undefined;
  currentIndex:number = 0;
  discountForm:FormGroup = new FormGroup({
    mode:new FormControl('directPercent'),
    percent:new FormControl(0),
    amount:new FormControl(0),
    selectDiscount:new FormControl(''),
    password:new FormControl('',Validators.required),
    reason:new FormControl('',Validators.required),
  });
  password:string = '';
  discounts:CodeBaseDiscount[] = []
  constructor(private dialogRef:DialogRef,public dataProvider:DataProvider,private dialog:Dialog) {
  }

  switchDiscount(currentDiscountId:string){
    let discount = this.dataProvider.discounts.find((a)=>a.id == currentDiscountId);
    if(discount.mode == 'codeBased' && this.currentDiscount.mode == 'codeBased'){
      this.currentDiscount.name = discount.name;
      this.currentDiscount.value = discount.value;
      this.currentDiscount.totalAppliedDiscount = discount.totalAppliedDiscount;
      this.currentDiscount.accessLevels = discount.accessLevels;
      this.currentDiscount.creationDate = discount.creationDate;
      this.currentDiscount.type = discount.type;
      this.currentDiscount.id = discount.id;
    }
  }

  ngOnInit(): void {
    if(this.dataProvider.currentBill){
      this.currentDiscount = this.dataProvider.currentBill.billing.discount[0];
    }
    this.password = ""
  }

  addDiscount(){
    this.dataProvider.currentBill.billing.discount.push({
      mode:'directPercent',
      creationDate:Timestamp.now(),
      reason:'',
      value:0,
      totalAppliedDiscount:0,
    });
  }

  submit(){
    if(this.discountForm.value.password != this.dataProvider.password){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Invalid Password',description:'Please enter the correct password to continue.',buttons:['Ok'],primary:[0]}})
      return;
    }
    console.log(this.discountForm.value);
    if (this.discountForm.value.mode == 'codeBased'){
      this.dialogRef.close({discount:this.discountForm.value.selectDiscount,discounted:true})
    } else if (this.discountForm.value.mode == 'directPercent'){
      let discount = {
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
      let discount = {
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
