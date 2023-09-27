import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, Injector, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import Fuse from 'fuse.js';
import { CustomerInfo } from '../../../types/user.structure';
import { AlertsAndNotificationsService } from '../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { Charge } from '../../../types/charges.structure';

@Component({
  selector: 'app-customer-panel',
  templateUrl: './customer-panel.component.html',
  styleUrls: ['./customer-panel.component.scss'],
})
export class CustomerPanelComponent implements OnInit {
  customerInfoForm: FormGroup = new FormGroup({
    name: new FormControl(
      {
        value: this.dataProvider.currentBill?.customerInfo.name,
        disabled: this.dataProvider.currentBill?.stage != 'active',
      },
      [
        Validators.nullValidator,
      ],
    ),
    phone: new FormControl(
      {
        value: this.dataProvider.currentBill?.customerInfo.phone,
        disabled: this.dataProvider.currentBill?.stage != 'active',
      },
      [
        Validators.pattern('[0-9]{10}'),
      ],
    ),
    address: new FormControl(
      {
        value: this.dataProvider.currentBill?.customerInfo.address,
        disabled: this.dataProvider.currentBill?.stage != 'active',
      },
      [
        Validators.nullValidator,
      ],
    ),
    gst: new FormControl({
      value: this.dataProvider.currentBill?.customerInfo.gst,
      disabled: this.dataProvider.currentBill?.stage != 'active',
    }),
    deliveryName: new FormControl(),
    deliveryPhone: new FormControl(),
  });
  loyaltySettingForm: FormGroup = new FormGroup({
    receiveLoyalty: new FormControl(),
    redeemLoyalty: new FormControl(),
    totalToBeRedeemedPoints: new FormControl(0, [
      Validators.min(0),
      Validators.max(this.dataProvider.currentBill?.customerInfo.loyaltyPoints),
    ]),
  });
  chargesForm:FormGroup = new FormGroup({
    deliverySelected:new FormControl(false),
    deliveryCharge:new FormControl(0),
    tipSelected:new FormControl(false),
    tip:new FormControl(0),
    serviceSelected:new FormControl(false),
    serviceCharge:new FormControl(0),
    containerSelected:new FormControl(false),
    containerCharge:new FormControl(0),
  })
  @Input() padding: boolean = true;
  @Input() orderFrequency: number = 0;
  @Input() lastMonth: string = 'Jan';
  @Input() averageOrderPrice: number = 300;
  @Input() isDialog: boolean = true;
  @Input() lastOrderDish: string[] = ['Chicken', 'Rice', 'Salad'];
  numberFuseInstance: Fuse<CustomerInfo> = new Fuse(
    this.dataProvider.customers,
    {
      keys: ['phone'],
    },
  );
  foundCustomers: CustomerInfo[] = [];
  searchString: Subject<string> = new Subject<string>();
  constructor(
    public dataProvider: DataProvider,
    private injector: Injector,
    private alertify:AlertsAndNotificationsService,
  ) {
    if (this.dataProvider.currentBill) {
      this.loyaltySettingForm.patchValue(this.dataProvider.currentBill.currentLoyalty);
      // this.chargesForm.patchValue(this.dataProvider.currentBill.appliedCharges);
      let chargesSettings = this.dataProvider.charges[this.dataProvider.currentBill.mode];
      let appliedCharges = this.dataProvider.currentBill.appliedCharges;
      this.patchCharges(chargesSettings,appliedCharges);
      this.customerInfoForm.enable();
      this.loyaltySettingForm.enable();
    } else {
      this.customerInfoForm.disable();
      this.loyaltySettingForm.disable();
    }
    this.customerInfoForm.valueChanges
      .pipe(debounceTime(1000))
      .subscribe((value) => {
        if (value.name || value.phone || value.address) {
          if (value.phone && value.phone.toString().length != 10) {
            return;
          }
          this.dataProvider.currentBill?.setCustomerInfo(value);
           console.log('value', this.customerInfoForm);
        }
      });
    this.dataProvider.billAssigned.subscribe(() => {
      this.dataProvider.modeChanged.subscribe(() => {
        if (this.dataProvider.currentBill) {
          if (this.dataProvider.currentBill.mode == 'online') {
            // update controls instead of adding them
            this.customerInfoForm.controls['deliveryName'].setValidators([
              Validators.required,
            ]);
            this.customerInfoForm.controls['deliveryPhone'].setValidators([
              Validators.required,
            ]);
          }
          console.log('CUSTOM:', this.dataProvider.currentBill?.customerInfo);

          // set values
          this.customerInfoForm.patchValue({
            name: this.dataProvider.currentBill?.customerInfo.name,
            phone: this.dataProvider.currentBill?.customerInfo.phone,
            address: this.dataProvider.currentBill?.customerInfo.address,
            deliveryName:
              this.dataProvider.currentBill?.customerInfo.deliveryName,
            deliveryPhone:
              this.dataProvider.currentBill?.customerInfo.deliveryPhone,
          });
          this.customerInfoForm.enable();
          let chargesSettings = this.dataProvider.charges[this.dataProvider.currentBill.mode];
          let appliedCharges = this.dataProvider.currentBill.appliedCharges;
          this.patchCharges(chargesSettings,appliedCharges);
        } else {
          this.customerInfoForm.disable();
        }
        this.setChargesControl();
      });
      this.setChargesControl();
    });
    this.dataProvider.customersUpdated.subscribe(() => {
      this.numberFuseInstance.setCollection(this.dataProvider.customers);
    });

    this.searchString.pipe(debounceTime(700)).subscribe((value) => {
      console.log('searching', value, this.dataProvider.customers);
      if (value) {
        const results = this.numberFuseInstance
          .search(value)
          .map((result) => result.item);
        console.log('results', results);
        this.foundCustomers = results;
      } else {
        this.foundCustomers = [];
      }
    });

    this.loyaltySettingForm.valueChanges.subscribe((value) => {
      console.log('value', value);
      this.dataProvider.currentBill.currentLoyalty = {
        ...this.dataProvider.currentBill.currentLoyalty,
        ...value,
      };
      this.dataProvider.currentBill.updated.next();
    });

    this.chargesForm.valueChanges.pipe(debounceTime(1000)).subscribe((value)=>{
      this.setCharges(value);
    })

  }

  setCharges(value:any){
    if(this.dataProvider?.currentBill){
      let chargesSettings = this.dataProvider.charges[this.dataProvider.currentBill.mode];
      let appliedCharges = this.dataProvider.currentBill.appliedCharges;
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
        console.log("setting delivery charge",appliedCharges.deliveryCharge);
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

  selectCustomer(event: any) {
    console.log("setting customer info",event.option.value);
    this.customerInfoForm.patchValue(event.option.value);
    this.dataProvider.currentBill?.setCustomerInfo(event.option.value);
  }

  ngOnInit(): void {
    let controls = Object.keys(this.customerInfoForm.controls);
    console.log('controls', controls);
    if (
      !controls.includes('deliveryName') ||
      !controls.includes('deliveryPhone')
    ) {
      if (this.dataProvider.currentBill?.mode == 'online') {
        // update controls instead of adding them
        this.customerInfoForm.controls['deliveryName'].setValue(
          this.dataProvider.currentBill?.customerInfo.deliveryName,
        );
        this.customerInfoForm.controls['deliveryName'].setValidators([
          Validators.required,
        ]);
        this.customerInfoForm.controls['deliveryPhone'].setValue(
          this.dataProvider.currentBill?.customerInfo.deliveryPhone,
        );
        this.customerInfoForm.controls['deliveryPhone'].setValidators([
          Validators.required,
        ]);
      }
    }
    this.customerInfoForm.disable();
    if (this.dataProvider.getAccess('writeCustomerInfo')) {
      this.customerInfoForm.enable();
    }
    this.numberFuseInstance.setCollection(this.dataProvider.customers);
  }

  submit() {
    if (this.customerInfoForm.invalid){
      alert("Invalid form");
      return;
    }
    this.setCharges(this.chargesForm.value);
    this.dataProvider.currentBill?.setCustomerInfo(this.customerInfoForm.value);
    if (this.isDialog) {
      // inject dialofRef
      this.injector.get(DialogRef).close();
    }
  }

  wordsToSentence(words: string[]): string {
    let sentence = '';
    for (let i = 0; i < words.length; i++) {
      sentence += words[i];
      if (i < words.length - 1) {
        // add and and ,
        if (i == words.length - 2) {
          sentence += ' and ';
        } else {
          sentence += ', ';
        }
      } else {
        sentence += '.';
      }
    }
    return sentence;
  }

  setLoyaltyCost(value: number | null | string) {
    // check if value is number only
    if (typeof value == 'string') {
      value = Number(value);
    }
    if (value > this.dataProvider.currentBill?.customerInfo?.loyaltyPoints){
      value = this.dataProvider.currentBill?.customerInfo?.loyaltyPoints;
      // update form
      this.loyaltySettingForm.patchValue({
        totalToBeRedeemedPoints: value,
      });
      this.alertify.presentToast('Loyalty points exceeded');
    }
    console.log("REDEEM",this.dataProvider.currentBill.currentLoyalty.totalToBeRedeemedCost,this.dataProvider.currentBill.currentLoyalty.totalLoyaltyCost,this.dataProvider.currentBill.currentLoyalty.totalLoyaltyPoints,Number(value));
    if(this.dataProvider.currentBill){
      this.dataProvider.currentBill.currentLoyalty.totalToBeRedeemedCost =
        (this.dataProvider.currentBill.currentLoyalty.totalLoyaltyCost /
          this.dataProvider.currentBill.currentLoyalty.totalLoyaltyPoints) *
        Number(value);
    }
  }

  getPrimaryLoyaltyCost(loyaltyPoints:number): number {
    if (this.loyaltySettingForm.value.totalToBeRedeemedPoints) {
      loyaltyPoints = (loyaltyPoints - Number(this.loyaltySettingForm.value.totalToBeRedeemedPoints));
    }
    if(this.dataProvider.currentBill){
      return (
        (this.dataProvider.currentBill.currentLoyalty.totalLoyaltyCost /
          this.dataProvider.currentBill.currentLoyalty.totalLoyaltyPoints) *
        loyaltyPoints
      );
    } else {
      return 0;
    }
  }

  setChargesControl(){
    if(this.dataProvider.currentBill.mode == 'dineIn'){
      // if (this.dataProvider.customCharges.dineIn.includes('delivery')) this.chargesForm.controls.deliveryCharge.setValidators();
      // if (this.dataProvider.customCharges.dineIn.includes('tip')) this.chargesForm.controls.tip.setValidators();
      // if (this.dataProvider.customCharges.dineIn.includes('service')) this.chargesForm.controls.serviceCharge.setValidators();
      // if (this.dataProvider.customCharges.dineIn.includes('container')) this.chargesForm.controls.containerCharge.setValidators();
    } else if(this.dataProvider.currentBill.mode == 'takeaway'){
      // if (this.dataProvider.customCharges.takeaway.includes('delivery')) this.chargesForm.controls.deliveryCharge.setValidators();
      // if (this.dataProvider.customCharges.takeaway.includes('tip')) this.chargesForm.controls.tip.setValidators();
      // if (this.dataProvider.customCharges.takeaway.includes('service')) this.chargesForm.controls.serviceCharge.setValidators();
      // if (this.dataProvider.customCharges.takeaway.includes('container')) this.chargesForm.controls.containerCharge.setValidators();
    } else if(this.dataProvider.currentBill.mode == 'online'){
      // if (this.dataProvider.customCharges.online.includes('delivery')) this.chargesForm.controls.deliveryCharge.setValidators();
      // if (this.dataProvider.customCharges.online.includes('tip')) this.chargesForm.controls.tip.setValidators();
      // if (this.dataProvider.customCharges.online.includes('service')) this.chargesForm.controls.serviceCharge.setValidators();
      // if (this.dataProvider.customCharges.online.includes('container')) this.chargesForm.controls.containerCharge.setValidators();
    }
  }
}
