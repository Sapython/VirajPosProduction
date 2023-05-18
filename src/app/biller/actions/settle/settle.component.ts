import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, QueryList, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProvider } from '../../../provider/data-provider.service';
import { SplitBillComponent } from '../split-bill/split-bill.component';
import { DatabaseService } from '../../../services/database.service';
import { BillConstructor, Product, Tax } from '../../constructors';
import { Discount } from '../../settings/settings.component';
import { PrintingService } from '../../../services/printing.service';
import { AlertsAndNotificationsService } from '../../../services/alerts-and-notification/alerts-and-notifications.service';
import { DialogComponent } from '../../../base-components/dialog/dialog.component';

@Component({
  selector: 'app-settle',
  templateUrl: './settle.component.html',
  styleUrls: ['./settle.component.scss']
})
export class SettleComponent {
  percentageSplitForm:FormGroup = new FormGroup({})
  percentageSplits:FormControl[] = []
  percentageValueError:boolean = false
  billSum:number = 2000;
  methods:any[] = [
    {
      paymentMethod:'Cash',
      paymentMethods: ['Cash','Card','UPI','Wallet'],
      amount:0
    }
  ]
  settleBillForm:FormGroup = new FormGroup({
    paymentMethod: new FormControl(''),
    cardEnding: new FormControl(''),
    upiAddress: new FormControl(''),
    customerName: new FormControl(''),
    customerContact: new FormControl(''),
    recipents: new FormControl(''),
    splitMethod: new FormControl(''),
    percentageSplitForm:this.percentageSplitForm
  })
  // @ViewChild('method') method:QueryList<any>;
  
  constructor(private dialogRef:DialogRef,public dataProvider:DataProvider,private dialog:Dialog,public databaseService:DatabaseService,private alertify:AlertsAndNotificationsService){
    this.settleBillForm.valueChanges.subscribe((value)=>{
      this.percentageSplits = []
      console.log(value);
      if (Number(value.recipents) > 0){
        this.percentageSplitForm = new FormGroup({})
        for (let i = 0; i < Number(value.recipents); i++){
          let control = new FormControl('',Validators.required)
          this.percentageSplitForm.addControl(`recipent${i}`,control)
          this.percentageSplits.push(control)
        }
      }
    })
    this.percentageSplitForm.valueChanges.subscribe((value)=>{
      let total = 0
      for (let key in value){
        total += Number(value[key])
      }
      if (total > 100){
        this.percentageValueError = true
      } else if (total == 100){
        this.percentageValueError = false
      } else {
        this.percentageValueError = true
      }
    })
  }

  close(){
    this.dialogRef.close()
  }
  
  async settleBill(){
    if (this.billSum == this.totalPaid){
      // check for conflicting payment methods
      let paymentMethods = this.methods.map((method)=>method.paymentMethod)
      let uniquePaymentMethods = [...new Set(paymentMethods)]
      if (paymentMethods.length !== uniquePaymentMethods.length){
        this.alertify.presentToast('Conflicting payment methods')
        return
      }
      this.dialogRef.close({paymentMethods,settling:true});
      this.alertify.presentToast('Bill Settled')
    } else {
      this.alertify.presentToast('Amount does not match bill amount')
    }
  }

  
  get totalPaid(){
    return this.methods.reduce((acc,cur)=>{
      return acc + Number(cur.amount)
    },0)
  }

  async addMethod(amount?:number){
    let usedMethods = this.methods.map((method)=>method.paymentMethod)
    let unusedMethods = ['Cash','Card','UPI','Wallet'].filter((method)=>{
      return !usedMethods.includes(method)
    })
    if (unusedMethods.length === 0){
      this.alertify.presentToast('No more methods')
      return
    }
    if (this.billSum > this.totalPaid){
      amount = this.billSum - this.totalPaid
    }
    this.methods.push({
      paymentMethod:unusedMethods[0],
      amount:amount || 0,
      paymentMethods: unusedMethods
    })
  }
  
  addOnReturn(event){
    if (event.key === 'Enter'){
      if (this.billSum > this.totalPaid){
        this.addMethod()
      } else if (this.billSum == this.totalPaid) {
        this.settleBill()
      } else {
        this.alertify.presentToast('Amount exceeds bill amount')
      }
    }
  }
}
