import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataProvider } from '../../provider/data-provider.service';
import { AddDiscountComponent } from './add-discount/add-discount.component';
import { CancelComponent } from './cancel/cancel.component';
import { NonChargeableComponent } from './non-chargeable/non-chargeable.component';
import { SettleComponent } from './settle/settle.component';
import { CustomerPanelComponent } from '../customer-panel/customer-panel.component';
import { Product } from '../constructors';
import { Kot } from '../Kot';
import {
  zoomInOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
import { SplitBillComponent } from './split-bill/split-bill.component';
import { CodeBaseDiscount, DirectFlatDiscount, DirectPercentDiscount } from '../settings/settings.component';
import { PrintingService } from '../../services/printing.service';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  animations: [
    zoomInOnEnterAnimation({ duration: 300 }),
    zoomOutOnLeaveAnimation({ duration: 300 }),
  ],
})
export class ActionsComponent {
  @Input() billNo: number = 0;
  @Input() billTokenNo: number = 0;
  @Input() billAmount: number = 0;
  @Input() tableNo: number = 0;
  @Input() billTime: number = 0;
  @Output() printKot = new EventEmitter();
  @Output() raiseConcern = new EventEmitter();
  isNonChargeable: boolean = false;
  seeMore: boolean = false;
  activeKotIndex: number = 0;
  kots: Kot[] = [];
  allKot: Kot[] = [];
  constructor(public dataProvider: DataProvider, private dialog: Dialog,private printingService:PrintingService,public databaseService:DatabaseService) {
    this.dataProvider.billAssigned.subscribe(() => {
      if (this.dataProvider.currentBill) {
        if (
          this.dataProvider.currentBill &&
          this.dataProvider.currentBill?.kots &&
          this.dataProvider.currentBill?.kots.filter(
            (kot) => kot.stage == 'finalized'
          )[0] &&
          this.dataProvider.currentBill?.kots.filter(
            (kot) => kot.stage == 'finalized'
          )[0].products.length > 0
        ) {
          this.dataProvider.kotViewVisible = true;
        }
        this.dataProvider.currentBill.updated.subscribe(() => {
          if (this.dataProvider.currentBill) {
            // this.activeKotIndex = this.dataProvider.currentBill!.kots.findIndex((kot: Kot) => kot.stage === 'active' || kot.stage === 'edit');
            if (this.dataProvider.currentBill.kots) {
              this.allKot = this.dataProvider.currentBill.kots;
              let activeKot = this.dataProvider.currentBill.kots.find(
                (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit'
              );
              this.activeKotIndex =
                this.dataProvider.currentBill.kots.findIndex(
                  (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit'
                );
              console.log('this.activeKotIndex', this.activeKotIndex);
              if (activeKot) {
                this.kots = [activeKot];
              } else {
                this.kots = [];
              }
            } else {
              this.kots = [];
            }
          }
        });
      }
    });
  }

  cancelBill() {
    if (this.dataProvider.currentBill) {
      let dialog = this.dialog.open(CancelComponent);
      dialog.closed.subscribe((result: any) => {
        if (result.reason && result.phone) {
          this.dataProvider.currentBill?.cancel(result.reason, result.phone);
        }
      });
    }
  }
  delete(index: Product) {
    this.dataProvider.currentBill?.removeProduct(index, this.activeKotIndex);
  }

  finalizeBill() {
    if (this.dataProvider.currentBill) {
      this.dataProvider.currentBill.finalize();
    }
  }

  settleBill() {
    if (this.dataProvider.currentBill) {
      let dialog = this.dialog.open(SettleComponent,{data:this.dataProvider.currentBill.billing.grandTotal});
      dialog.closed.subscribe((result: any) => {
        console.log('Result', result);
        if (result && this.dataProvider.currentBill && result.settling && result.paymentMethods) {
          this.dataProvider.currentBill.settle(result.paymentMethods,result.detail || null);
        }
      });
    }
  }
  
  generateId() {
    // random alphanumeric id
    return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9) 
  }

  splitAndSettle(){
    const dialog = this.dialog.open(SplitBillComponent,{data:this.dataProvider.currentBill})
    dialog.closed.subscribe(async (value:any)=>{
      console.log(value);
      if (value){
        let data = {
          ...this.dataProvider.currentBill?.toObject(),
        }
        this.dataProvider.currentBill?.calculateBill()
        console.log("bills",value,this.dataProvider.currentBill);
        let billNo = await this.dataProvider.currentBill!.settle([
          {
            amount: value.amount,
            paymentMethod: 'Cash',
            paymentMethods: ['Cash', 'Card', 'UPI', 'Wallet'],
          }
        ])
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
                  kotItems.push({ ...product, quantity: product.quantity,id:product.id || '' });
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
          // TODO: urgent
          // calculate discounts
          // let discounts:(CodeBaseDiscount|DirectFlatDiscount|DirectPercentDiscount)[] = data.billing!.discount.map((discount) => {
            // if (discount.type === 'percentage'){
            //   return {
            //     ...discount,
            //     totalAppliedDiscount: (discount.value / 100) * data.billing!.subTotal,
            //   };
            // } else {
            //   return {
            //     ...discount,
            //     totalAppliedDiscount: discount.value,
            //   };
            // }
          // })
          // data.billing!.discount = discounts;
          // console.log("discounts",discounts);
          // calculate taxes from taxes 
          // TODO: urgent
          // taxes.map((tax) => {
          //   tax.amount = (tax.value / 100) * data.billing!.subTotal;
          // })
          // console.log("taxes",taxes);
          // let totalTax = taxes.reduce((acc, cur) => {
          //   return acc + (cur.value / 100) * data.billing!.subTotal;
          // }, 0);
          // console.log("totalTax",totalTax);
          // data.billing!.taxes = taxes;
          // data.billing!.totalTax = totalTax;
          // data.billing!.grandTotal = data.billing!.subTotal + totalTax;
          // console.log("grandTotal",data.billing!.grandTotal);
          // console.log("data 1",data);
          this.printingService.reprintBill(data as any)
          this.databaseService.updateBill(data)
          console.log("data 2",data);
        })
      }
    })
  }

  addDiscount() {
    const dialog = this.dialog.open(AddDiscountComponent);
    // dialog.closed.subscribe((result: any) => {
    //   if (this.dataProvider.currentBill && result?.discounted) {
    //     this.dataProvider.currentBill.addDiscount(result.discount);
    //   }
    // });
  }

  nonChargeable(event: any) {
    console.log(event);
    if (this.dataProvider.currentBill && event.checked) {
      const dialog = this.dialog.open(NonChargeableComponent);
      dialog.closed.subscribe((result: any) => {
        if (!result || !result.nonChargeable) {
          this.isNonChargeable = false;
          return;
        }
        if (this.dataProvider.currentBill && result.nonChargeable) {
          this.dataProvider.currentBill.setAsNonChargeable(
            result.name || '',
            result.phone || '',
            result.reason || ''
          );
        }
      });
    } else if (this.dataProvider.currentBill && !event.checked) {
      this.dataProvider.currentBill.setAsNormal();
    }
  }

  addCustomerInfo() {
    const dialog = this.dialog.open(CustomerPanelComponent, {
      data: { dialog: true },
    });
    // dialog.closed.subscribe((result)=>{})
  }

  toggleManageKot() {
    //  ? dataProvider.kotViewVisible=true : dataProvider.kotViewVisible = false
    if(this.dataProvider.manageKot == false){
      // find any active kot if not found then set dataProvider.kotViewVisible to true
      let activeKot = this.dataProvider.currentBill?.kots.find(
        (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit'
      );
      if (!activeKot) {
        if (this.dataProvider.currentBill?.stage == 'finalized'){
          this.dataProvider.allProducts = true;
          return
        }
        this.dataProvider.kotViewVisible = true;
      }
    }
  }

  splitBill() {
    if (this.dataProvider.currentBill) {
      const dialog = this.dialog.open(SplitBillComponent, {
        data: this.dataProvider.currentBill,
      });
      // this.dataProvider.currentBill.splitBill()
    }
  }
}
