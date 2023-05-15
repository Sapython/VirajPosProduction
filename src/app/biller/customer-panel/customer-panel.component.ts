import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, Injector, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { DataProvider } from '../../provider/data-provider.service';

@Component({
  selector: 'app-customer-panel',
  templateUrl: './customer-panel.component.html',
  styleUrls: ['./customer-panel.component.scss']
})
export class CustomerPanelComponent {
  customerInfoForm:FormGroup = new FormGroup({
    name: new FormControl(this.dataProvider.currentBill?.customerInfo.name,[this.dataProvider.currentBill?.mode=='takeaway' ? Validators.required : Validators.nullValidator]),
    phone: new FormControl(this.dataProvider.currentBill?.customerInfo.phone,[this.dataProvider.currentBill?.mode=='takeaway' ? Validators.required : Validators.nullValidator]),
    address: new FormControl(this.dataProvider.currentBill?.customerInfo.address,[this.dataProvider.currentBill?.mode=='takeaway' ? Validators.required : Validators.nullValidator]),
    gst: new FormControl(this.dataProvider.currentBill?.customerInfo.gst),
  });
  @Input() padding: boolean = true;
  @Input() orderFrequency: number = 0;
  @Input() lastMonth: string = "Jan";
  @Input() averageOrderPrice: number = 300;
  @Input() isDialog: boolean = true;
  @Input() lastOrderDish: string[] = ["Chicken",'Rice','Salad'];

  constructor(public dataProvider:DataProvider,private injector:Injector) {
    if(this.dataProvider.currentBill){
      this.customerInfoForm.enable();
    } else {
      this.customerInfoForm.disable();
    }
    this.customerInfoForm.valueChanges.pipe(debounceTime(1000)).subscribe((value)=>{
      if (value.name || value.phone || value.address) {
        this.dataProvider.currentBill?.setCustomerInfo(value)
        console.log("value",this.dataProvider.currentBill?.customerInfo);
      }
    })
    this.dataProvider.billAssigned.subscribe(()=>{
      if(this.dataProvider.currentBill){
        if (this.dataProvider.currentBill.mode == 'online') {
          this.customerInfoForm.addControl('deliveryName', new FormControl(this.dataProvider.currentBill?.customerInfo.deliveryName, [Validators.required]));
          this.customerInfoForm.addControl('deliveryPhone', new FormControl(this.dataProvider.currentBill?.customerInfo.deliveryPhone, [Validators.required]));
        }
        // set values
        this.customerInfoForm.patchValue({
          name: this.dataProvider.currentBill?.customerInfo.name,
          phone: this.dataProvider.currentBill?.customerInfo.phone,
          address: this.dataProvider.currentBill?.customerInfo.address,
          deliveryName: this.dataProvider.currentBill?.customerInfo.deliveryName,
          deliveryPhone: this.dataProvider.currentBill?.customerInfo.deliveryPhone,
        })
        this.customerInfoForm.enable();
      } else {
        this.customerInfoForm.disable();
      }
    })
  }

  submit(){
    this.dataProvider.currentBill?.setCustomerInfo(this.customerInfoForm.value);
    if (this.isDialog){
      // inject dialofRef
      this.injector.get(DialogRef).close();
    }
  }

  wordsToSentence(words: string[]): string {
    let sentence = "";
    for (let i = 0; i < words.length; i++) {
      sentence += words[i];
      if (i < words.length - 1) {
        // add and and ,
        if (i == words.length - 2) {
          sentence += " and ";
        } else {
          sentence += ", ";
        }
      } else {
        sentence += ".";
      }
    }
    return sentence;
  }
}
