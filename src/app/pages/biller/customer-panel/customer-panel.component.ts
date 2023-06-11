import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, Injector, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { Customer } from '../../../types/customer.structure';
import Fuse from 'fuse.js';

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
      ]
    ),
    phone: new FormControl(
      {
        value:this.dataProvider.currentBill?.customerInfo.phone,
        disabled: this.dataProvider.currentBill?.stage != 'active',
      }, [
      this.dataProvider.currentBill?.mode == 'takeaway'
        ? Validators.required
        : Validators.nullValidator,
    ]),
    address: new FormControl(
      {
        value:this.dataProvider.currentBill?.customerInfo.address,
        disabled: this.dataProvider.currentBill?.stage != 'active',
      },
      [
        this.dataProvider.currentBill?.mode == 'takeaway'
          ? Validators.required
          : Validators.nullValidator,
      ]
    ),
    gst: new FormControl(
      {
        value:this.dataProvider.currentBill?.customerInfo.gst,
        disabled: this.dataProvider.currentBill?.stage != 'active',
      }
    ),
  });
  @Input() padding: boolean = true;
  @Input() orderFrequency: number = 0;
  @Input() lastMonth: string = 'Jan';
  @Input() averageOrderPrice: number = 300;
  @Input() isDialog: boolean = true;
  @Input() lastOrderDish: string[] = ['Chicken', 'Rice', 'Salad'];
  numberFuseInstance:Fuse<Customer> = new Fuse(this.dataProvider.customers,{keys:['phone']});
  foundCustomers:Customer[] = [];
  searchString:Subject<string> = new Subject<string>();
  constructor(public dataProvider: DataProvider, private injector: Injector) {
    if (this.dataProvider.currentBill) {
      this.customerInfoForm.enable();
    } else {
      this.customerInfoForm.disable();
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
      if (this.dataProvider.currentBill) {
        if (this.dataProvider.currentBill.mode == 'online') {
          this.customerInfoForm.addControl(
            'deliveryName',
            new FormControl(
              {
                value:this.dataProvider.currentBill?.customerInfo.deliveryName,
                disabled: this.dataProvider.currentBill?.stage != 'active',
              },
              [Validators.required]
            )
          );
          this.customerInfoForm.addControl(
            'deliveryPhone',
            new FormControl(
              {
                value:this.dataProvider.currentBill?.customerInfo.deliveryPhone,
                disabled: this.dataProvider.currentBill?.stage != 'active',
              },
              [Validators.required]
            )
          );
        }
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
    this.dataProvider.customersUpdated.subscribe(() => {
      this.numberFuseInstance.setCollection(this.dataProvider.customers);
    });

    this.searchString.pipe(debounceTime(700)).subscribe((value) => {
      console.log('searching', value,this.dataProvider.customers);
      if (value) {
        const results = this.numberFuseInstance.search(value).map((result) => result.item);
        console.log('results', results);
        this.foundCustomers = results;
      } else {
        this.foundCustomers = [];
      }
    })
  }

  selectCustomer(event:any){
    this.customerInfoForm.patchValue(event.option.value);
    this.dataProvider.currentBill?.setCustomerInfo(event.option.value);
  }

  ngOnInit(): void {
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
}
