import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, Injector, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import Fuse from 'fuse.js';
import { CustomerInfo } from '../../../types/user.structure';
import { AlertsAndNotificationsService } from '../../../core/services/alerts-and-notification/alerts-and-notifications.service';

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
        this.dataProvider.currentBill?.mode == 'takeaway'
          ? Validators.required
          : Validators.nullValidator,
      ],
    ),
    phone: new FormControl(
      {
        value: this.dataProvider.currentBill?.customerInfo.phone,
        disabled: this.dataProvider.currentBill?.stage != 'active',
      },
      [
        this.dataProvider.currentBill?.mode == 'takeaway'
          ? Validators.required
          : Validators.nullValidator,
        Validators.pattern('^[0-9]*$'),
      ],
    ),
    address: new FormControl(
      {
        value: this.dataProvider.currentBill?.customerInfo.address,
        disabled: this.dataProvider.currentBill?.stage != 'active',
      },
      [
        this.dataProvider.currentBill?.mode == 'takeaway'
          ? Validators.required
          : Validators.nullValidator,
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
    private alertify:AlertsAndNotificationsService
  ) {
    if (this.dataProvider.currentBill) {
      this.loyaltySettingForm.patchValue(this.dataProvider.currentBill.currentLoyalty);
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
          this.dataProvider.currentBill?.setCustomerInfo(value);
          //  console.log('value', this.dataProvider.currentBill?.customerInfo);
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
        } else {
          this.customerInfoForm.disable();
        }
      });
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
  }

  selectCustomer(event: any) {
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
    if (value) {
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
  }
}
