import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription, firstValueFrom, merge } from 'rxjs';
import {
  zoomInOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
import { Dialog } from '@angular/cdk/dialog';
import { ReasonComponent } from './reason/reason.component';
import { Timestamp } from '@angular/fire/firestore';
import { Kot } from '../../../core/constructors/kot/Kot';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { Product } from '../../../types/product.structure';
import { CancelKOtComponent } from './cancel-kot/cancel-kot.component';
import { UserManagementService } from '../../../core/services/auth/user/user-management.service';
import { ApplicableCombo } from '../../../core/constructors/comboKot/comboKot';
@Component({
  selector: 'app-active-kot',
  templateUrl: './active-kot.component.html',
  styleUrls: ['./active-kot.component.scss'],
  animations: [
    zoomInOnEnterAnimation({ duration: 300 }),
    zoomOutOnLeaveAnimation({ duration: 300 }),
  ],
})
export class ActiveKotComponent implements OnChanges, OnDestroy {
  kots: Kot[] = [];
  allKot: Kot[] = [];
  labels: { color: { color: string; contrast: string }; name: string }[] = [];
  activeKotIndex: number = 0;
  activeKotSubscription: Subscription = Subscription.EMPTY;
  kotNoColors: { color: string; contrast: string }[] = [
    { color: '#4dc9f6', contrast: '#000' },
    { color: '#f67019', contrast: '#fff' },
    { color: '#f53794', contrast: '#fff' },
    { color: '#537bc4', contrast: '#fff' },
    { color: '#acc236', contrast: '#fff' },
    { color: '#166a8f', contrast: '#fff' },
    { color: '#00a950', contrast: '#fff' },
    { color: '#58595b', contrast: '#fff' },
    { color: '#8549ba', contrast: '#fff' },
  ];
  actionSheetExpanded: boolean = false;
  billAssignedSubscription: Subscription = Subscription.EMPTY;
  manageKotSubscription: Subscription = Subscription.EMPTY;
  openTableViewSubscription: Subscription = Subscription.EMPTY;
  resetKotViewSubscription: Subscription = Subscription.EMPTY;
  constructor(
    public dataProvider: DataProvider,
    private dialog: Dialog,
    private userManagementService: UserManagementService,
  ) {
    this.billAssignedSubscription = this.dataProvider.billAssigned.subscribe(() => {
      this.kots = [];
      this.allKot = [];
      this.dataProvider.kotViewVisible = true;
      this.dataProvider.manageKot = false;
      this.dataProvider.allProducts = false;
      //  console.log("this.dataProvider.currentBill",this.dataProvider.currentBill);
      this.generateLabels();
      if (this.dataProvider.currentBill) {
        this.kots =
          this.dataProvider.currentBill.kots.filter(
            (kot) => kot.stage == 'active',
          ) || [];
        if (this.kots.length > 0) {
          this.dataProvider.kotViewVisible = false;
        }
        this.activeKotSubscription.unsubscribe();
        this.activeKotSubscription = merge(
          this.dataProvider.currentBill.updated,
          this.dataProvider.currentBill.billUpdated,
        ).subscribe((bill: any) => {
          this.generateLabels();
          if (!this.dataProvider.currentBill) {
            this.activeKotSubscription.unsubscribe();
            return;
          }
          if (this.dataProvider.currentBill.kots) {
            this.allKot = this.dataProvider.currentBill.kots;
            let activeKot = this.dataProvider.currentBill.kots.find(
              (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit',
            );
            // console.log("GENO 2", this.dataProvider.currentBill.kots);
            this.activeKotIndex = this.dataProvider.currentBill.kots.findIndex(
              (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit',
            );
            //  console.log('this.activeKotIndex', this.activeKotIndex);
            if (activeKot) {
              this.kots = [activeKot];
              this.dataProvider.kotViewVisible = false;
            } else {
              this.kots = [];
            }
            // console.log("GENO 3",this.kots);
          } else {
            this.kots = [];
          }
        });
      }
    });
    this.manageKotSubscription = this.dataProvider.manageKotChanged.subscribe((state: boolean) => {
      this.allKot = this.dataProvider.currentBill?.kots || [];
    });
    this.openTableViewSubscription = this.dataProvider.openTableView.subscribe((state: boolean) => {
      // reset the kot view
      this.kots = [];
      this.allKot = [];
      this.labels = [];
      this.dataProvider.kotViewVisible = true;
      this.dataProvider.manageKot = false;
      this.dataProvider.allProducts = false;
    });
    this.resetKotViewSubscription = this.dataProvider.resetKotView.subscribe((state: boolean) => {
      // reset the kot view
      this.kots = [];
      this.allKot = [];
      this.labels = [];
      this.dataProvider.kotViewVisible = true;
      this.dataProvider.manageKot = false;
      this.dataProvider.allProducts = false;
    });
  }

  ngOnDestroy(): void {
    this.billAssignedSubscription.unsubscribe();
    this.manageKotSubscription.unsubscribe();
    this.openTableViewSubscription.unsubscribe();
    this.resetKotViewSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.generateLabels();
  }

  generateLabels() {
    this.labels = [];
    if (this.dataProvider.currentBill && this.dataProvider.currentBill.kots) {
      for (let i = 0; i < this.dataProvider.currentBill.kots.length; i++) {
        this.labels.push({
          color: this.kotNoColors[i % this.kotNoColors.length],
          name: this.dataProvider.currentBill.kots[i].id,
        });
      }
    }
    //  console.log('this.labels', this.labels);
  }

  async delete(product: Product | ApplicableCombo) {
    if (this.dataProvider.currentBill?.editKotMode) {
      const index = this.dataProvider.currentBill?.editKotMode.newKot.findIndex(
        (item) => item.id === product.id,
      );
      if (product.itemType == 'combo'){
        this.dataProvider.currentApplicableCombo = undefined;
        this.dataProvider.currentCombo = undefined;
      }
      this.dataProvider.currentBill?.editKotMode.newKot.splice(index, 1);
      this.dataProvider.currentBill.calculateBill();
      if(this.dataProvider.currentBill.kots[this.activeKotIndex].products.length == 0){
        if (this.dataProvider.currentBill.kots.length >= 2){
          this.dataProvider.kotViewVisible = true;
        }
      }
    } else {
      this.activeKotIndex = this.dataProvider.currentBill.kots.findIndex(
        (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit',
      );
      // console.log("Removing this.activeKotIndex",this.activeKotIndex);
      this.dataProvider.currentBill?.removeProduct(
        product,
        this.activeKotIndex,
      );
      if (product.itemType == 'combo'){
        this.dataProvider.currentApplicableCombo = undefined;
        this.dataProvider.currentCombo = undefined;
      }
      if(this.dataProvider.currentBill.kots[this.activeKotIndex].products.length == 0){
        if (this.dataProvider.currentBill.kots.length >= 2){
          this.dataProvider.kotViewVisible = true;
        }
      }
    }
  }

  async printKot(kot: Kot) {
    if (
      await this.userManagementService.authenticateAction([
        'punchKot'
      ])
    ) {
      let dialog = this.dialog.open(ReasonComponent);
      firstValueFrom(dialog.closed).then((reason: string) => {
        this.dataProvider.currentBill?.printKot(kot, 'reprintKot', reason);
      });
    }
  }

  async deleteKot(kot: Kot) {
    if (
      await this.userManagementService.authenticateAction([
        'deleteKot'
      ])
    ) {
      const dialog = this.dialog.open(CancelKOtComponent);
      let reason: any = await firstValueFrom(dialog.closed);
      if (reason) {
        kot.cancelReason = {
          reason: reason.reason,
          mode: reason.mode,
          time: Timestamp.now(),
          user: {
            access:this.dataProvider.currentBusinessUser.accessType == 'role' ? this.dataProvider.currentBusinessUser.role : 'custom',
            username: this.dataProvider.currentBusinessUser.username,
          },
        };
        // console.log('Cancel reason kot: ', kot.cancelReason);

        this.dataProvider.currentBill?.deleteKot(kot);
      }
      // this.dataProvider.currentBill?.deleteKot(kot);
    }
  }

  async editKot(kot: Kot) {
    if (
      await this.userManagementService.authenticateAction([
        'editKot'
      ])
    ) {
      var passwordRequired = true;
      if (kot.totalTimeTakenNumber < 60){
        passwordRequired = false;
      }
      // console.log("Password required",passwordRequired);
      let dialog = this.dialog.open(ReasonComponent,{data:{passwordRequired}});
      firstValueFrom(dialog.closed).then((reason: string) => {
        if(reason){
          this.dataProvider.currentBill?.editKot(kot, reason);
        }
      });
    }
  }

  saveEditedKot(kot: Kot) {}

  get showImage() {
    if (this.dataProvider.currentBill) {
      if (this.dataProvider.currentBill.kots.length > 0) {
        if (this.dataProvider.currentBill.editKotMode) {
          if (this.dataProvider.currentBill.editKotMode.newKot.length > 0) {
            return false;
          }
        } else if (this.kots.length > 0 && this.kots[0].products.length > 0) {
          return false;
        } else if (
          this.dataProvider.manageKot &&
          this.allKot.reduce((acc, curr) => acc + curr.products.length, 0) > 0
        ) {
          return false;
        }
      }
    }
    return true;
  }
}
