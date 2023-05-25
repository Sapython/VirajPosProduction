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
      console.log(value);
      if (value){
        value.forEach((splitData:any)=>{
          var billing = {
            subTotal:0,
            taxes:[],
            grandTotal:0,
            discount:[],
            totalTax:0
          };
          console.log("value",splitData);
          let allProducts: any[] = [];
          splitData.kots.forEach((kot) => {
            if (kot.stage === 'finalized' || kot.stage === 'active') {
              // add product or increase quantity
              kot.products.forEach((product) => {
                let item = allProducts.find((item) => item.id === product.id);
                if (item) {
                  item.quantity += product.quantity;
                } else {
                  allProducts.push({ ...product, quantity: product.quantity });
                }
              })
            }
          })
          console.log("All products",allProducts);
          
          // check individual product for tax and if the tax.mode is inclusive then add the applicable tax to totalTaxValue or if the tax.mode is exclusive then decrease the price of product by tax rate and add the applicableValue to totalTaxValue
          let finalTaxes = JSON.parse(JSON.stringify(this.dataProvider.taxes)).map((tax:any) => {return {...tax,amount:0}})
          var modifiedAllProducts = [];
          allProducts.forEach((product) => {
            if (product.taxes) {
              console.log("product taxes",product.taxes);
              let inclusive = product.taxes.find((tax) => tax.nature === 'inclusive') ? true : false;
              console.log("Mode",inclusive);
              let applicableDiscount = 0;
              let totalAmount = product.price * product.quantity;
              let applicableTax = 0;
              product.taxes.forEach((tax) => {
                if (tax.type === 'percentage'){
                  let taxAmount = (totalAmount * tax.cost) / 100;
                  applicableTax += taxAmount;
                  // find tax in finalTaxes and add the taxAmount to it
                  let index = finalTaxes.findIndex((item:Tax) => item.id === tax.id);
                  if (index !== -1){
                    console.log("adding",taxAmount);
                    finalTaxes[index].amount += taxAmount;
                  }
                } else {
                  applicableTax += tax.cost;
                  // find tax in finalTaxes and add the taxAmount to it
                  let index = finalTaxes.findIndex((item:Tax) => item.id === tax.id);
                  if (index !== -1){
                    finalTaxes[index].amount += tax.cost;
                  }
                }
              })
              let additionalTax = 0;
              finalTaxes.forEach((tax:Tax) => {
                if (tax.mode === 'bill'){
                  if (tax.type === 'percentage'){
                    let taxAmount = (totalAmount * tax.cost) / 100;
                    additionalTax += taxAmount;
                    // find tax in finalTaxes and add the taxAmount to it
                    let index = finalTaxes.findIndex((item:Tax) => item.id === tax.id);
                    if (index !== -1){
                      console.log("adding",taxAmount);
                      finalTaxes[index].amount += taxAmount;
                    }
                  } else {
                    additionalTax += tax.cost;
                    // find tax in finalTaxes and add the taxAmount to it
                    let index = finalTaxes.findIndex((item:Tax) => item.id === tax.id);
                    if (index !== -1){
                      finalTaxes[index].amount += tax.cost;
                    }
                  }
                }
              })
              if (inclusive){
                product.untaxedValue = (totalAmount - applicableTax) + additionalTax;
                console.log("inclusive",product.untaxedValue);
              } else {
                product.untaxedValue = totalAmount + additionalTax;
                console.log("exclusive",product.untaxedValue);
              }
              if (product.lineDiscount) {
                if (product.lineDiscount.type === 'percentage'){
                  applicableDiscount = product.lineDiscount.value;
                } else {
                  applicableDiscount = (product.lineDiscount.value / product.untaxedValue) * 100;
                }
                product.lineDiscounted = true;
              }
              billing.discount.forEach((discount) => {
                  if (discount.mode == 'codeBased'){
                    if (discount.type === 'percentage'){
                      applicableDiscount += discount.value;
                    } else {
                      let discountValue = (discount.value / product.untaxedValue) * 100;
                      applicableDiscount += discountValue;
                    }
                  } else if (discount.mode == 'directFlat') {
                    applicableDiscount += discount.value;
                  } else if (discount.mode == 'directPercent') {
                    let discountValue = (discount.value / product.untaxedValue) * 100;
                    applicableDiscount += discountValue;
                  }
              })
              product.taxedValue = totalAmount;
              product.discountedValue = product.untaxedValue - applicableDiscount;
              product.taxedDiscountedValue = (product.untaxedValue - applicableDiscount) + applicableTax;
              product.applicableTax = applicableTax;
              product.applicableDiscount = applicableDiscount;
              // add product to modifiedAllProducts if it already exists increase quantity or else add it and also add it when the product is lineDiscounted
              let index = modifiedAllProducts.findIndex((item) => item.id === product.id);
              if (index !== -1){
                if (product.lineDiscounted){
                  modifiedAllProducts.push(product);
                } else {
                  modifiedAllProducts[index].quantity += product.quantity;
                }
              } else {
                modifiedAllProducts.push(product);
              }
            }
          })
  
          console.log("allProducts",allProducts,"modifiedAllProducts",modifiedAllProducts,"kots",this.kots);
  
          // this.modifiedAllProducts = JSON.parse(JSON.stringify(allProducts));
  
          billing.subTotal = allProducts.reduce((acc, cur) => {
            return acc + cur.untaxedValue;
          }, 0)
  
          billing.taxes = finalTaxes.filter((tax) => tax.amount > 0);
          billing.grandTotal = allProducts.reduce((acc, cur) => {
            return acc + cur.taxedDiscountedValue;
          }, 0)
          console.log(billing,"all products",allProducts,"discounted",billing.discount,"final taxes",finalTaxes);
          let bill:BillConstructor = {
            billing:billing,
            kots:splitData.kots,
            id:this.generateId(),
            billNo:this.dataProvider.currentBill?.billNo,
            billingMode:'cash',
            billReprints:this.dataProvider.currentBill?.billReprints,
            createdDate:Timestamp.now(),
            customerInfo:this.dataProvider.currentBill?.customerInfo,
            stage:'finalized',
            mode:this.dataProvider.currentBill?.mode,
            table:this.dataProvider.currentBill?.table,
            modifiedAllProducts:modifiedAllProducts,
            optionalTax:this.dataProvider.currentBill?.optionalTax,
            orderNo:this.dataProvider.currentBill?.orderNo,
            tokens:this.dataProvider.currentBill?.tokens,
            user:this.dataProvider.currentBill?.user,
            cancelledReason:this.dataProvider.currentBill?.cancelledReason,
            instruction:this.dataProvider.currentBill?.instruction,
            nonChargeableDetail:this.dataProvider.currentBill?.nonChargeableDetail,
            settlement:this.dataProvider.currentBill?.settlement,
          }
          this.printingService.reprintBill(bill);
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
}
