import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit, QueryList, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from '../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { SettingsService } from '../../../../core/services/database/settings/settings.service';
import { Menu } from '../../../../types/menu.structure';
import { ModeConfig } from '../../../../core/constructors/menu/menu';
import { Bill } from '../../../../core/constructors/bill';

@Component({
  selector: 'app-settle',
  templateUrl: './settle.component.html',
  styleUrls: ['./settle.component.scss'],
})
export class SettleComponent implements OnInit {
  percentageSplitForm: FormGroup = new FormGroup({});
  percentageSplits: FormControl[] = [];
  percentageValueError: boolean = false;
  additionalMethods: string[] = [];
  methodsWithDetail: string[] = [];
  methods: any[] = [
    {
      paymentMethod: 'Cash',
      paymentMethods: [
        'Cash',
        'Card',
        'UPI',
        'Wallet',
        ...this.additionalMethods,
      ],
      amount: 0,
      custom: false,
    },
  ];
  detailForm: FormGroup = new FormGroup({
    phone: new FormControl('', Validators.required),
  });
  settleBillForm: FormGroup = new FormGroup({
    paymentMethod: new FormControl(''),
    cardEnding: new FormControl(''),
    upiAddress: new FormControl(''),
    customerName: new FormControl(''),
    customerContact: new FormControl(''),
    recipents: new FormControl(''),
    splitMethod: new FormControl(''),
    percentageSplitForm: this.percentageSplitForm,
  });
  currentModeConfig: ModeConfig | undefined;
  // @ViewChild('method') method:QueryList<any>;

  constructor(
    private dialogRef: DialogRef,
    public dataProvider: DataProvider,
    private settingService: SettingsService,
    private alertify: AlertsAndNotificationsService,
    @Inject(DIALOG_DATA) public billSum: number,
  ) {
    this.settleBillForm.valueChanges.subscribe((value) => {
      this.percentageSplits = [];
      //  console.log(value);
      if (Number(value.recipents) > 0) {
        this.percentageSplitForm = new FormGroup({});
        for (let i = 0; i < Number(value.recipents); i++) {
          let control = new FormControl('', Validators.required);
          this.percentageSplitForm.addControl(`recipent${i}`, control);
          this.percentageSplits.push(control);
        }
      }
    });
    this.percentageSplitForm.valueChanges.subscribe((value) => {
      let total = 0;
      for (let key in value) {
        total += Number(value[key]);
      }
      if (total > 100) {
        this.percentageValueError = true;
      } else if (total == 100) {
        this.percentageValueError = false;
      } else {
        this.percentageValueError = true;
      }
    });
  }

  ngOnInit(): void {
    this.settingService.getPaymentMethods().then((methods) => {
      this.additionalMethods = methods.docs.map((d) => {
        return d.data()['name'];
      });
      this.methods.forEach((method) => {
        method.paymentMethods = [
          'Cash',
          'Card',
          'UPI',
          'Wallet',
          ...this.additionalMethods,
        ];
      });
      this.methodsWithDetail = methods.docs
        .filter((d) => {
          return d.data()['detail'];
        })
        .map((d) => {
          return d.data()['name'];
        });
      //  console.log("this.methodsWithDetail",this.methodsWithDetail,"this.additionalMethods",this.additionalMethods);
    });
    // set first value of the first method to the difference of billSum and totalPaid
    this.methods[0].amount = this.billSum;
  }

  close() {
    this.dialogRef.close();
  }

  async settleBill() {
    if (!(this.customDetailRequired ? this.detailForm.valid : true)) {
      this.alertify.presentToast('Missing required fields');
      return;
    }
    if (this.billSum <= this.totalPaid) {
      // check for conflicting payment methods
      if (this.totalPaid > this.billSum) {
        // adjust the last method
        this.methods[this.methods.length - 1].amount -=
          this.totalPaid - this.billSum;
      }
      let paymentMethods = this.methods.map((method) => method);
      this.dialogRef.close({
        paymentMethods,
        settling: true,
        detail: this.detailForm.value,
      });
      this.alertify.presentToast('Bill Settled');
    } else {
      this.alertify.presentToast('Amount does not match bill amount');
    }
  }

  get customDetailRequired() {
    return this.methods.filter((method) => {
      return (
        method.paymentMethods.includes(method.paymentMethod) &&
        this.methodsWithDetail.includes(method.paymentMethod)
      );
    }).length > 0
      ? true
      : false;
  }

  get totalPaid() {
    return this.methods.reduce((acc, cur) => {
      return acc + Number(cur.amount);
    }, 0);
  }

  async addMethod(amount?: number) {
    let usedMethods = this.methods.map((method) => method.paymentMethod);
    // let unusedMethods = ['Cash','Card','UPI','Wallet',...this.additionalMethods].filter((method)=>{
    //   return !usedMethods.includes(method)
    // })
    let unusedMethods = [
      'Cash',
      'Card',
      'UPI',
      'Wallet',
      ...this.additionalMethods,
    ];
    if (unusedMethods.length === 0) {
      this.alertify.presentToast('No more methods');
      return;
    }
    if (this.billSum > this.totalPaid) {
      amount = this.billSum - this.totalPaid;
    }
    this.methods.push({
      paymentMethod: unusedMethods[0],
      amount: amount || 0,
      paymentMethods: unusedMethods,
    });
  }

  addOnReturn(event) {
    console.log(event);
    event.stopPropagation();
    if (event.key === 'Enter') {
      if (this.billSum > this.totalPaid) {
        this.addMethod();
      } else if (this.billSum <= this.totalPaid) {
        this.settleBill();
      } else {
        this.alertify.presentToast('Amount exceeds bill amount');
      }
    }
  }
}
