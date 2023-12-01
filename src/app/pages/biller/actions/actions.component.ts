import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
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
import { UserManagementService } from '../../../core/services/auth/user/user-management.service';
import { BillService } from '../../../core/services/database/bill/bill.service';
import { PaymentMethod } from '../../../types/payment.structure';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  animations: [
    zoomInOnEnterAnimation({ duration: 300 }),
    zoomOutOnLeaveAnimation({ duration: 300 }),
  ],
})
export class ActionsComponent implements OnDestroy {
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
  billAssignedSubscription:Subscription = Subscription.EMPTY;
  currentBillUpdatedSubscription:Subscription = Subscription.EMPTY;

  constructor(
    public dataProvider: DataProvider,
    private dialog: Dialog,
    private userManagementService: UserManagementService,
    private billService:BillService
  ) {
    this.billAssignedSubscription = this.dataProvider.billAssigned.subscribe(() => {
      if (this.dataProvider.currentBill) {
        this.isNonChargeable =
          !!this.dataProvider.currentBill.nonChargeableDetail;
        if (
          this.dataProvider.currentBill &&
          this.dataProvider.currentBill?.kots &&
          this.dataProvider.currentBill?.kots.filter(
            (kot) => kot.stage == 'finalized',
          )[0] &&
          this.dataProvider.currentBill?.kots.filter(
            (kot) => kot.stage == 'finalized',
          )[0].products.length > 0
        ) {
          let activeKot = this.dataProvider.currentBill.kots.find(
            (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit',
          );
          if (activeKot){
            this.dataProvider.kotViewVisible =  false;
          } else {
            this.dataProvider.kotViewVisible = true;
          }
        }
        this.currentBillUpdatedSubscription.unsubscribe();
        this.currentBillUpdatedSubscription = this.dataProvider.currentBill.updated.subscribe(() => {
          if (this.dataProvider.currentBill) {
            this.isNonChargeable =
              !!this.dataProvider.currentBill.nonChargeableDetail;
            // this.activeKotIndex = this.dataProvider.currentBill!.kots.findIndex((kot: Kot) => kot.stage === 'active' || kot.stage === 'edit');
            if (this.dataProvider.currentBill.kots) {
              this.allKot = this.dataProvider.currentBill.kots;
              let activeKot = this.dataProvider.currentBill.kots.find(
                (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit',
              );
              this.activeKotIndex =
                this.dataProvider.currentBill.kots.findIndex(
                  (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit',
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

  ngOnDestroy(): void {
    this.billAssignedSubscription.unsubscribe();
    this.currentBillUpdatedSubscription.unsubscribe();
  }

  async cancelBill() {
    if (
      await this.userManagementService.authenticateAction([
        'cancelBill'
      ])
    ) {
      if (this.dataProvider.currentBill) {
        let dialog = this.dialog.open(CancelComponent);
        firstValueFrom(dialog.closed).then((result: any) => {
          if (result.reason && result.phone) {
            this.dataProvider.currentBill?.cancel(result.reason, result.phone);
          }
        });
      }
    }
  }
  delete(index: Product) {
    this.dataProvider.currentBill?.removeProduct(index, this.activeKotIndex);
  }

  async finalizeBill() {
    let elevateReq = await this.userManagementService.authenticateAction([
      'finalizeBill'
    ]);
    if (
      elevateReq.status === true
    ) {
      if (this.dataProvider.currentBill) {
        this.dataProvider.currentBill.finalize();
      }
    }
  }

  async settleBill() {
    let elevateReq = await this.userManagementService.authenticateAction([
      'settleBill',
    ])
    if (elevateReq.status === true) {
      if (this.dataProvider.currentBill) {
        let dialog = this.dialog.open(SettleComponent, {
          data: this.dataProvider.currentBill.billing.grandTotal
        });
        firstValueFrom(dialog.closed).then((result: any) => {
          // console.log('Settle Result', result);
          if (
            result &&
            this.dataProvider.currentBill &&
            result.settling &&
            result.paymentMethods
          ) {
            this.dataProvider.currentBill.settlementElevatedUser = elevateReq.username;
            this.dataProvider.currentBill.settle(
              result.paymentMethods,
              'internal',
              result.detail || null,
              true
            );
          }
        });
      }
    }
  }

  async quickSettle(paymentMethod: PaymentMethod) {
    // console.log("QuickMethod: Quick Settling Bill");
    let elevateReq = await this.userManagementService.authenticateAction([
      'settleBill',
    ]);
    if (elevateReq.status === true){
      this.dataProvider.currentBill.settle(
        [{
          amount:this.dataProvider.currentBill.billing.grandTotal,
          paymentMethod:paymentMethod.name
        }],
        'internal',
        null,
        true,
        paymentMethod
      );
    }
  }

  async holdBill(paymentMethod: PaymentMethod){
    // console.log("QuickMethod: Holding Bill");
    let elevateReq = await this.userManagementService.authenticateAction([
      'settleBill',
    ]);
    if (elevateReq.status === true){
      this.dataProvider.currentBill.finalize(false,true);
      this.dataProvider.currentBill = undefined;
    }
  }

  generateId() {
    // random alphanumeric id
    return (
      Math.random().toString(36).substr(2, 9) +
      Math.random().toString(36).substr(2, 9) +
      Math.random().toString(36).substr(2, 9)
    );
  }

  async splitAndSettle() {
    let elevatedReq = await this.userManagementService.authenticateAction([
      'splitBill'
    ])
    if (elevatedReq.status === true) {
      this.dialog.open(SplitBillComponent, {
        data: {
          bill:this.dataProvider.currentBill,
          elevatedUser: elevatedReq.username,
        },
      });
    }
  }

  async addDiscount() {
    let elevateReq = await this.userManagementService.authenticateAction([
      'applyDiscount'
    ])
    if (elevateReq.status === true) {
      const dialog = this.dialog.open(AddDiscountComponent, {
        data: this.dataProvider.currentBill,
      });
      firstValueFrom(dialog.closed).then((result: any) => {
        //  console.log("Result",result);
        if (typeof result == 'object' && this.dataProvider.currentBill) {
          //  console.log(result);
          result.forEach(element => {
            element.appliedBy = {
              user:this.dataProvider.currentUser.username,
              elevatedUser:elevateReq.username
            }
          });
          this.billService.addActivity(this.dataProvider.currentBill,{
            message:`Discount Applied`,
            type:'billDiscounted',
            user:this.dataProvider.currentUser.username,
            data:{
              discounts:result,
              customerInfo:this.dataProvider.currentBill.customerInfo
            }
          });
          this.dataProvider.currentBill.billing.discount = result;
          //  console.log("Applied discount",this.dataProvider.currentBill.billing.discount);
          this.dataProvider.currentBill.calculateBill();
        }
      });
    }
  }

  async nonChargeable(event: any) {
    //  console.log(event);
    let elevateReq = await this.userManagementService.authenticateAction([
      'setNonChargeable'
    ]);
    if (elevateReq.status === true) {
      if (this.dataProvider.currentBill && event.checked) {
        const dialog = this.dialog.open(NonChargeableComponent);
        firstValueFrom(dialog.closed).then((result: any) => {
          if (!result || !result.nonChargeable) {
            this.isNonChargeable = false;
            return;
          }
          if (this.dataProvider.currentBill && result.nonChargeable) {
            this.dataProvider.currentBill.setAsNonChargeable(
              result.name || '',
              result.phone || '',
              result.reason || '',
              {
                access: this.dataProvider.currentBusinessUser.accessType=='role' ? this.dataProvider.currentBusinessUser.role : 'custom',
                username: this.dataProvider.currentBusinessUser.username,
              },
              elevateReq.username
            );
          }
        });
      } else if (this.dataProvider.currentBill && !event.checked) {
        this.dataProvider.currentBill.setAsNormal();
      }
    }
  }

  addCustomerInfo() {
    const dialog = this.dialog.open(CustomerPanelComponent, {
      data: { dialog: true },
    });
  }

  toggleManageKot() {
    //  ? dataProvider.kotViewVisible=true : dataProvider.kotViewVisible = false
    if (this.dataProvider.manageKot == false) {
      // find any active kot if not found then set dataProvider.kotViewVisible to true
      let activeKot = this.dataProvider.currentBill?.kots.find(
        (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit',
      );
      if (!activeKot) {
        if (this.dataProvider.currentBill?.stage == 'finalized') {
          this.dataProvider.allProducts = true;
          this.dataProvider.kotViewVisible = false;
          this.dataProvider.manageKot = true;
          return;
        }
        this.dataProvider.kotViewVisible = true;
        this.dataProvider.allProducts = false;
      }
    } else {
      this.dataProvider.allProducts = false;
      this.dataProvider.kotViewVisible = false;
    }
  }

  async splitBill() {
    let elevatedReq = await this.userManagementService.authenticateAction([
      'splitBill'
    ])
    if (elevatedReq.status === true) {
      if (this.dataProvider.currentBill) {
        const dialog = this.dialog.open(SplitBillComponent, {
          data: {bill:this.dataProvider.currentBill,elevatedUser:elevatedReq.username},
        });
        // this.dataProvider.currentBill.splitBill()
      }
    }
  }

  async showPreview() {
    if (this.dataProvider.allProducts) {
      this.dataProvider.allProducts = false;
      return;
    }
    // check for any active kot if there is any active kot then show alert that you have to print the kot first
    if (
      this.dataProvider.currentBill?.kots.find(
        (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit',
      )
    ) {
      if (
        await this.dataProvider.confirm(
          'You have to print the kot first to see the preview',
          [1],
          { buttons: ['Cancel', 'Print'] },
        )
      ) {
        this.dataProvider.currentBill.finalizeAndPrintKot();
        this.dataProvider.allProducts = !this.dataProvider.allProducts;
      }
    } else {
      this.dataProvider.allProducts = !this.dataProvider.allProducts;
    }
  }
}
