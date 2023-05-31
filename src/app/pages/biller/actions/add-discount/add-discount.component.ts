import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { DialogComponent } from '../../../../shared/base-components/dialog/dialog.component';
import { CodeBaseDiscount, DirectFlatDiscount, DirectPercentDiscount } from '../../../../types/discount.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { firstValueFrom } from 'rxjs';
import { BillConstructor } from '../../../../types/bill.structure';
import { Bill } from '../../../../core/constructors/bill';


@Component({
  selector: 'app-add-discount',
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.scss']
})
export class AddDiscountComponent implements OnInit {
  mode:'codeBased'|'directPercent'|'directFlat'='directPercent';
  currentDiscount:CodeBaseDiscount|DirectFlatDiscount|DirectPercentDiscount|undefined;
  currentIndex:number = 0;
  password:string = '';
  reason:string = '';
  appliedDiscounts:(CodeBaseDiscount|DirectFlatDiscount|DirectPercentDiscount)[] = [];
  constructor(private dialogRef:DialogRef,public dataProvider:DataProvider,private dialog:Dialog,@Inject(DIALOG_DATA) bill:Bill|BillConstructor) {
    if(this.dataProvider.currentBill){
      this.appliedDiscounts = bill.billing.discount.map(discount=>{
        return discount;
      });
      this.currentDiscount = this.appliedDiscounts[0];
    }
  }

  switchDiscount(discount,index:number){
    this.appliedDiscounts[index] = {...this.dataProvider.discounts.find(d=>d.id == discount),reason:''};
    this.appliedDiscounts[index].mode = 'codeBased';
    console.log("Set",this.currentDiscount);
  }

  ngOnInit(): void {
    // if(this.dataProvider.currentBill){
    //   this.currentDiscount = this.dataProvider.currentBill.billing.discount[0];
    // }
    this.password = ""
    this.reason = ""
    // this.currentDiscount = 
    if(this.appliedDiscounts.length == 0){
      this.appliedDiscounts.push({
        mode:'codeBased',
        accessLevels:[],
        creationDate:Timestamp.now(),
        id:'',
        name:'',
        type:'percentage',
        menus:[],
        reason:'',
        value:0,
        totalAppliedDiscount:0,
      });
    }
    this.currentDiscount = this.appliedDiscounts[0]
    this.appliedDiscounts.forEach(discount=>{
      if (discount.reason){
        this.reason = discount.reason;
      }
    })
  }

  async addDiscount(){
    const dialog = await this.dialog.open(DialogComponent,{data:{
      title:'What type of discount?',
      description:'Please select the type of discount you want to add.',
      buttons:[
        'Code Based',
        'Direct Percent',
        'Direct Flat',
        'Cancel'
      ],
      primary:[0,1,2],
    }})
    let res = await firstValueFrom(dialog.closed)
    console.log(res);
    let response = res as number;
    if(response === 0){
      this.appliedDiscounts.push({
        mode:'codeBased',
        accessLevels:[],
        creationDate:Timestamp.now(),
        id:'',
        name:'',
        type:'percentage',
        menus:[],
        reason:'',
        value:0,
        totalAppliedDiscount:0,
      });
    } else if (response === 1){
      this.appliedDiscounts.push({
        mode:'directPercent',
        creationDate:Timestamp.now(),
        reason:'',
        value:0,
        totalAppliedDiscount:0,
      })
    } else if (response === 2){
      this.appliedDiscounts.push({
        mode:'directFlat',
        creationDate:Timestamp.now(),
        reason:'',
        value:0,
        totalAppliedDiscount:0,
      })
    } else {
      return;
    }
    if(this.appliedDiscounts.length-1 >= 0){
      this.currentDiscount = this.appliedDiscounts[this.appliedDiscounts.length-1];
    }
  }

  async submit(){
    if(!(await this.dataProvider.checkPassword(this.password))){
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Invalid Password',description:'Please enter the correct password to continue.',buttons:['Ok'],primary:[0]}})
      return;
    }
    this.appliedDiscounts.forEach(discount=>{
      discount.reason = this.reason;
    })
    console.log("applying",this.appliedDiscounts);
    this.dialogRef.close(this.appliedDiscounts);
    // if (this.discountForm.value.mode == 'codeBased'){
    //   this.dialogRef.close({discount:this.discountForm.value.selectDiscount,discounted:true})
    // } else if (this.discountForm.value.mode == 'directPercent'){
    //   let discount = {
    //     type:'percentage',
    //     id:Math.random().toString(36).substr(2, 9),
    //     name:'Direct Discount',
    //     value:this.discountForm.value.percent,
    //     totalAppliedDiscount:0,
    //     accessLevels:['admin'],
    //     creationDate:Timestamp.now(),
    //   }
    //   this.dialogRef.close({discount,discounted:true})
    // } else if (this.discountForm.value.mode == 'directFlat'){
    //   let discount = {
    //     type:'amount',
    //     id:Math.random().toString(36).substr(2, 9),
    //     name:'Direct Discount',
    //     value:this.discountForm.value.amount,
    //     totalAppliedDiscount:0,
    //     accessLevels:['admin'],
    //     creationDate:Timestamp.now(),
    //   }
    //   this.dialogRef.close({discount,discounted:true})
    // } else {
    //   this.dialogRef.close({discounted:false})
    // }
  }

  cancel(remove?:boolean,index?:number){
    if (this.dataProvider.multipleDiscount && index){
      this.appliedDiscounts.splice(index,1);
      if(this.appliedDiscounts.length-1 >= 0){
        this.currentDiscount = this.appliedDiscounts[this.appliedDiscounts.length-1];
      }
    } else {
      this.dialogRef.close(remove ? [] : false);
    }
  }

  get discountsValid(){
    // check if every discount in the billing.discounts has reason and password
    let valid = true;
    // this.appliedDiscounts.forEach(discount=>{
    // })
    for (const discount of this.appliedDiscounts) {
      if(!this.reason || !this.password || !discount || !discount.value){
        valid = false;
      }
    }
    return valid;
  }
}
