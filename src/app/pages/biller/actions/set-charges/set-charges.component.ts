import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { debounceTime } from 'rxjs';
import { Charge } from '../../../../types/charges.structure';
import { Bill } from '../../../../core/constructors/bill';
import { BillConstructor } from '../../../../types/bill.structure';

@Component({
  selector: 'app-set-charges',
  templateUrl: './set-charges.component.html',
  styleUrls: ['./set-charges.component.scss']
})
export class SetChargesComponent {
  chargesForm:FormGroup = new FormGroup({
    deliverySelected:new FormControl(false),
    deliveryCharge:new FormControl(0),
    tipSelected:new FormControl(false),
    tip:new FormControl(0),
    serviceSelected:new FormControl(false),
    serviceCharge:new FormControl(0),
    containerSelected:new FormControl(false),
    containerCharge:new FormControl(0),
  });
  
  constructor(public dialogRef:DialogRef,public dataProvider:DataProvider, @Inject(DIALOG_DATA) public bill:Bill|BillConstructor) {
    // console.log("this.dataProvider.charges",this.dataProvider.charges);
    let chargesSettings = this.dataProvider.charges[this.bill.mode];
    let appliedCharges = this.bill.appliedCharges;
    this.patchCharges(chargesSettings,appliedCharges);
    this.chargesForm.valueChanges.pipe(debounceTime(1000)).subscribe((value)=>{
      this.setCharges(value);
    })
  }
  setCharges(value:any){
    if(this.bill){
      let chargesSettings = this.dataProvider.charges[this.bill.mode];
      let appliedCharges = this.bill.appliedCharges;
      if (chargesSettings.container.allowed){
        if(!chargesSettings.container.fixed){
          appliedCharges.containerCharge = value.containerCharge;
        } else {
          if(value.containerSelected){
            appliedCharges.containerCharge = chargesSettings.container.charges;
          } else {
            appliedCharges.containerCharge = 0;
          }
        }
      }
      if (chargesSettings.delivery.allowed){
        if(!chargesSettings.delivery.fixed){
          appliedCharges.deliveryCharge = value.deliveryCharge;
        } else {
          if(value.deliverySelected){
            appliedCharges.deliveryCharge = chargesSettings.delivery.charges;
          } else {
            appliedCharges.deliveryCharge = 0;
          }
        }
      }
      if (chargesSettings.service.allowed){
        if(!chargesSettings.service.fixed){
          appliedCharges.serviceCharge = value.serviceCharge;
        } else {
          if(value.serviceSelected){
            appliedCharges.serviceCharge = chargesSettings.service.charges;
          } else {
            appliedCharges.serviceCharge = 0;
          }
        }
      }
      if (chargesSettings.tip.allowed){
        if(!chargesSettings.tip.fixed){
          appliedCharges.tip = value.tip;
        } else {
          if(value.tipSelected){
            appliedCharges.tip = chargesSettings.tip.charges;
          } else {
            appliedCharges.tip = 0;
          }
        }
      }
      // console.log("Applied: ",this.bill.appliedCharges);
    }
  }
  patchCharges(chargesSettings:Charge,appliedCharges:{containerCharge:number,deliveryCharge:number,tip:number,serviceCharge:number}) {
    if (chargesSettings.container.allowed){
      if(!chargesSettings.container.fixed){
        this.chargesForm.controls.containerCharge.setValue(appliedCharges.containerCharge);
      } else {
        if(appliedCharges.containerCharge == chargesSettings.container.charges){
          this.chargesForm.controls.containerSelected.setValue(true);
        } else {
          this.chargesForm.controls.containerSelected.setValue(false);
        }
      }
    }
    if (chargesSettings.delivery.allowed){
      if(!chargesSettings.delivery.fixed){
        // console.log("setting delivery charge",appliedCharges.deliveryCharge);
        this.chargesForm.controls.deliveryCharge.setValue(appliedCharges.deliveryCharge);
      } else {
        if(appliedCharges.deliveryCharge == chargesSettings.delivery.charges){
          this.chargesForm.controls.deliverySelected.setValue(true);
        } else {
          this.chargesForm.controls.deliverySelected.setValue(false);
        }
      }
    }
    if (chargesSettings.tip.allowed){
      if(!chargesSettings.tip.fixed){
        this.chargesForm.controls.tip.setValue(appliedCharges.tip);
      } else {
        if(appliedCharges.tip == chargesSettings.tip.charges){
          this.chargesForm.controls.tipSelected.setValue(true);
        } else {
          this.chargesForm.controls.tipSelected.setValue(false);
        }
      }
    }
    if (chargesSettings.service.allowed){
      if(!chargesSettings.service.fixed){
        this.chargesForm.controls.serviceCharge.setValue(appliedCharges.serviceCharge);
      } else {
        if(appliedCharges.serviceCharge == chargesSettings.service.charges){
          this.chargesForm.controls.serviceSelected.setValue(true);
        } else {
          this.chargesForm.controls.serviceSelected.setValue(false);
        }
      }
    }
  }
}
