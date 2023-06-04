import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AddDiscountComponent } from './add-discount/add-discount.component';
import { CancelComponent } from './cancel/cancel.component';
import { NonChargeableComponent } from './non-chargeable/non-chargeable.component';
import { SettleComponent } from './settle/settle.component';
import { CustomerPanelComponent } from '../customer-panel/customer-panel.component';
import {
  zoomInOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
import { SplitBillComponent } from './split-bill/split-bill.component';
import { Timestamp } from '@angular/fire/firestore';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { Kot } from '../../../core/constructors/kot/Kot';
import { PrinterService } from '../../../core/services/printing/printer/printer.service';
import { Product } from '../../../types/product.structure';
import { Tax } from '../../../types/tax.structure';
import { BillConstructor } from '../../../types/bill.structure';

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
  constructor(public dataProvider: DataProvider, private dialog: Dialog,private printingService:PrinterService,) {
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
            //  console.log('this.activeKotIndex', this.activeKotIndex);
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
      //  console.log('Result', result);
        if (result && this.dataProvider.currentBill && result.settling && result.paymentMethods) {
          this.dataProvider.currentBill.settle(result.paymentMethods,'internal',result.detail || null);
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
    //  console.log(value);
    })
  }

  addDiscount() {
    const dialog = this.dialog.open(AddDiscountComponent,{data:this.dataProvider.currentBill});
    dialog.closed.subscribe((result: any) => {
    //  console.log("Result",result);
      if (typeof result == 'object' && this.dataProvider.currentBill) {
      //  console.log(result);
        this.dataProvider.currentBill.billing.discount = result;
      //  console.log("Applied discount",this.dataProvider.currentBill.billing.discount);
        this.dataProvider.currentBill.calculateBill();
      }
    })
    // dialog.closed.subscribe((result: any) => {
    //   if (this.dataProvider.currentBill && result?.discounted) {
    //     this.dataProvider.currentBill.addDiscount(result.discount);
    //   }
    // });
  }

  nonChargeable(event: any) {
  //  console.log(event);
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
          this.dataProvider.kotViewVisible = false;
          this.dataProvider.manageKot = true;
          return
        }
        this.dataProvider.kotViewVisible = true;
        this.dataProvider.allProducts = false;
      }
    } else {
      this.dataProvider.allProducts = false;
      this.dataProvider.kotViewVisible = false;
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

  showPreview(){
    // check for any active kot if there is any active kot then show alert that you have to print the kot first
    if(this.dataProvider.currentBill?.kots.find((kot: Kot) => kot.stage === 'active' || kot.stage === 'edit')){
      if(this.dataProvider.confirm("You have to print the kot first to see the preview",[1],{buttons:["Cancel","Print"]})){
        this.printKot.emit()
      }
    }
    this.dataProvider.allProducts=!this.dataProvider.allProducts
  }
}
