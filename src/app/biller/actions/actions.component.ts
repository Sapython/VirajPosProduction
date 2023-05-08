import { Dialog } from '@angular/cdk/dialog';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataProvider } from 'src/app/provider/data-provider.service';
import { AddDiscountComponent } from './add-discount/add-discount.component';
import { CancelComponent } from './cancel/cancel.component';
import { NonChargeableComponent } from './non-chargeable/non-chargeable.component';
import { SettleComponent } from './settle/settle.component';
import { CustomerPanelComponent } from '../customer-panel/customer-panel.component';
import { MatDialog } from '@angular/material/dialog';
import { Product } from '../constructors';
import { Kot } from '../Kot';
import {
  zoomInOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
import { SplitBillComponent } from './split-bill/split-bill.component';

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
  constructor(public dataProvider: DataProvider, private dialog: MatDialog) {
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
      dialog.afterClosed().subscribe((result: any) => {
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
      let dialog = this.dialog.open(SettleComponent);
      dialog.afterClosed().subscribe((result: any) => {
        console.log('Result', result);
        if (this.dataProvider.currentBill && result.settling) {
          this.dataProvider.currentBill.settle(
            result.customerName || '',
            result.customerContact || '',
            result.paymentMethod || '',
            result.cardEnding || '',
            result.upiAddress || ''
          );
        }
      });
    }
  }

  addDiscount() {
    const dialog = this.dialog.open(AddDiscountComponent);
    dialog.afterClosed().subscribe((result: any) => {
      if (this.dataProvider.currentBill && result?.discounted) {
        this.dataProvider.currentBill.addDiscount(result.discount);
      }
    });
  }

  nonChargeable(event: any) {
    console.log(event);
    if (this.dataProvider.currentBill && event.checked) {
      const dialog = this.dialog.open(NonChargeableComponent);
      dialog.afterClosed().subscribe((result: any) => {
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
    // dialog.afterClosed().subscribe((result)=>{})
  }

  toggleManageKot() {}

  splitBill() {
    if (this.dataProvider.currentBill) {
      const dialog = this.dialog.open(SplitBillComponent, {
        data: this.dataProvider.currentBill,
      });
      // this.dataProvider.currentBill.splitBill()
    }
  }
}
