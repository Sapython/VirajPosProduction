import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { Bill } from '../../Bill';
import { KotConstructor, Product } from '../../constructors';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertsAndNotificationsService } from '../../../services/alerts-and-notification/alerts-and-notifications.service';

@Component({
  selector: 'app-split-bill',
  templateUrl: './split-bill.component.html',
  styleUrls: ['./split-bill.component.scss']
})
export class SplitBillComponent {
  allKots:KotConstructor[];
  splittedItems: splittedBill[] = [];

  selectAll(event:any,kot:KotConstructor){
    console.log("event",event);
    kot.products.forEach((product)=>{
      product.selected = event.checked;
    })
  }
  checkAll(event:any,kot:any,item:any){
    console.log("event",event);
    item.selected = event.checked;
    if (kot.products.every((product:any)=>product.selected)){
      kot.allSelected = true;
      kot.someSelected = false;
      console.log("kot",kot.allSelected);
    }else if (kot.products.some((product:any)=>product.selected)){
      kot.allSelected = false;
      kot.someSelected = true;
      console.log("kot",kot.someSelected);
    }else{
      kot.allSelected = false;
      kot.someSelected = false;
      console.log("kot",kot.someSelected);
    }
  }

  constructor(@Inject(DIALOG_DATA) private bill:Bill,private dialogRef:MatDialogRef<SplitBillComponent>,private alertify:AlertsAndNotificationsService) {
    this.allKots = JSON.parse(JSON.stringify(bill.kots.map((kot)=>kot.toObject())));
    this.allKots.forEach((kot)=>{
      kot.products.forEach((product)=>{
        product.selected = false;
      })
    })
  }

  cancel(){
    this.dialogRef.close();
  }

  splitBill(){
    let products:any[] = [];
    this.allKots.forEach((kot)=>{
      kot.products.forEach((product)=>{
        if(product.selected){
          products.push({...product,kot:kot});
        }
      })
    })
    if (products.length == 0){
      this.alertify.presentToast("Please select atleast one item to split");
      return;
    }
    let grandTotal = products.reduce((acc,product)=>acc+product.price,0);
    this.splittedItems.push({products:products,grandTotal:grandTotal});
    // remove products from bill
    this.splittedItems.forEach((splittedItem)=>{
      // match kot and product id and remove from main bill
      splittedItem.products.forEach((product)=>{
        this.allKots.forEach((kot)=>{
          if(kot.id == product.kot.id){
            kot.products = kot.products.filter((kotProduct)=>kotProduct.id != product.id);
          }
        })
      });
    })
    console.log("bill",this.bill.kots);
  }

  saveSplittedBill(){
    // TODO: create new bill with splitted items
    // TODO: 
    this.bill.splitBill(this.splittedItems);
    // TODO: group the splitted items into kots
    let bills:any[] = []
    JSON.parse(JSON.stringify(this.splittedItems)).forEach((splittedItem:splittedBill)=>{
      let kots:KotConstructor[] = [];
      splittedItem.products.forEach((product)=>{
        let kot = kots.find((kot)=>kot.id == product.kot.id);
        if(kot){
          kot.products.push(product);
        }else{
          product.kot.products = [product];
          kots.push(product.kot);
        }
      })
      bills.push({
        kots: kots,
        grandTotal:splittedItem.grandTotal
      });
    })
    // remove empty kots and remove duplicate products from kots by checking kot id and product id
    bills.forEach((bill)=>{
      this.bill.kots.forEach((kot:any)=>{
        kot.products = kot.products.filter((d:any)=>{
          return !bill.kots.find((k:any)=>k.id == kot.id && k.products.find((p:any)=>p.id == d.id))
        })
      })
      bill.kots = bill.kots.filter((kot:any)=>kot.products.length > 0);
    })
    this.bill.calculateBill();
    console.log("bills",bills,this.bill);
    this.dialogRef.close(bills);
  }

}
export interface splittedBill {
  products:splittedProduct[];
  grandTotal:number;
}
export interface splittedProduct extends Product{
  kot:KotConstructor;
}
