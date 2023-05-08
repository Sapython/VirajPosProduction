import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataProvider } from 'src/app/provider/data-provider.service';
import { SplitBillComponent } from '../split-bill/split-bill.component';
import { DatabaseService } from 'src/app/services/database.service';
import { Bill } from '../../Bill';
import { BillConstructor, Product, Tax } from '../../constructors';
import { Discount } from '../../settings/settings.component';
import { PrintingService } from 'src/app/services/printing.service';

const taxes:Tax[] = [
  {
    id: 'tax1',
    name: 'SGST',
    type: 'percentage',
    value: 2.5,
    amount:0
  },
  {
    id: 'tax1',
    name: 'CGST',
    type: 'percentage',
    value: 2.5,
    amount:0
  },
]

@Component({
  selector: 'app-settle',
  templateUrl: './settle.component.html',
  styleUrls: ['./settle.component.scss']
})
export class SettleComponent {
  percentageSplitForm:FormGroup = new FormGroup({})
  percentageSplits:FormControl[] = []
  percentageValueError:boolean = false
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
  
  constructor(private dialogRef:MatDialogRef<SettleComponent>,public dataProvider:DataProvider,private dialog:MatDialog,public databaseService:DatabaseService,private printingService:PrintingService){
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
  
  settleBill(){
    console.log({...this.settleBillForm.value,settling:true});
    this.dialogRef.close({...this.settleBillForm.value,settling:true});
  }

  generateId() {
    // random alphanumeric id
    return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9) 
  }

  splitAndSettle(){
    const dialog = this.dialog.open(SplitBillComponent,{data:this.dataProvider.currentBill})
    dialog.afterClosed().subscribe((value)=>{
      console.log(value);
      if (value){
        let data = {
          ...this.dataProvider.currentBill?.toObject(),
        }
        this.dataProvider.currentBill?.calculateBill()
        console.log("bills",value,this.dataProvider.currentBill);
        let billNo = this.dataProvider.currentBill!.settle(this.settleBillForm.value.customerName,this.settleBillForm.value.customerContact,this.settleBillForm.value.paymentMethod,this.settleBillForm.value.cardEnding,this.settleBillForm.value.upiAddress)
        value.forEach((bill:any)=>{
          bill.kots.forEach((kot:any)=>{
            kot.products.forEach((product:any)=>{
              delete product.kot
            })
          })
          data.billNo = billNo
          data.kots = bill.kots;
          data.id = this.generateId()
          // calculate all billing props
          data.billing = JSON.parse(JSON.stringify(data.billing))
          if (data.billingMode === 'nonChargeable') {
            data.billing!.subTotal = 0;
            data.billing!.grandTotal = 0;
            return;
          }
          let kotItems: { id: string; quantity: number }[] = [];
          data.kots!.forEach((kot) => {
            if (kot.stage === 'active') {
              kot.products.forEach((product:Product) => {
                let item = kotItems.find((item) => item.id === product.id);
                if (item) {
                  item.quantity += product.quantity;
                } else {
                  kotItems.push({ ...product, quantity: product.quantity });
                }
              });
            }
          });
          console.log('kot items', kotItems);

          data.billing!.subTotal = data.kots!.reduce((acc, cur) => {
            return (
              acc +
              cur.products.reduce((acc: number, cur: { price: number; quantity: number; }) => {
                return acc + cur.price * cur.quantity;
              }, 0)
            );
          }, 0);
          console.log("subtotal",data.billing!.subTotal);
          // calculate discounts
          let discounts:Discount[] = data.billing!.discount.map((discount) => {
            if (discount.type === 'percentage'){
              return {
                ...discount,
                totalAppliedDiscount: (discount.value / 100) * data.billing!.subTotal,
              };
            } else {
              return {
                ...discount,
                totalAppliedDiscount: discount.value,
              };
            }
          })
          data.billing!.discount = discounts;
          console.log("discounts",discounts);
          // calculate taxes from taxes 
          taxes.map((tax) => {
            tax.amount = (tax.value / 100) * data.billing!.subTotal;
          })
          console.log("taxes",taxes);
          let totalTax = taxes.reduce((acc, cur) => {
            return acc + (cur.value / 100) * data.billing!.subTotal;
          }, 0);
          console.log("totalTax",totalTax);
          data.billing!.taxes = taxes;
          data.billing!.totalTax = totalTax;
          data.billing!.grandTotal = data.billing!.subTotal + totalTax;
          console.log("grandTotal",data.billing!.grandTotal);
          console.log("data 1",data);
          this.printingService.reprintBill(data as any)
          this.databaseService.updateBill(data)
          console.log("data 2",data);
          this.dialogRef.close()
          // let billInstance = new Bill(
          //   this.generateId(),
          //   this.dataProvider.currentBill!.table,
          //   this.dataProvider.currentBill!.mode,
          //   this.dataProvider.currentBill!.device,
          //   this.dataProvider.currentBill!.user,
          //   this.dataProvider.currentBill!.menu,
          //   this.dataProvider,
          //   this.databaseService,
          //   this.dataProvider.currentBill!.billNo
          // )
          // billInstance.kots = bill.kots;
          // console.log("billInstance",billInstance);
        })
        // this.dialogRef.close({...this.settleBillForm.value,settling:true,splitMethod:value.splitMethod,percentageSplitForm:value.percentageSplitForm})
      }
    })
  }
}
