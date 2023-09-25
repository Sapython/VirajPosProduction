import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryLoyaltyRate, LoyaltySetting } from '../../../../../types/loyalty.structure';
import { ModeConfig } from '../../../../../core/constructors/menu/menu';
import { Timestamp } from '@angular/fire/firestore';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';

@Component({
  selector: 'app-add-loyalty-setting',
  templateUrl: './add-loyalty-setting.component.html',
  styleUrls: ['./add-loyalty-setting.component.scss'],
})
export class AddLoyaltySettingComponent implements OnInit {
  constructor(
    @Inject(DIALOG_DATA) private data: { menu: ModeConfig,loyaltySetting:LoyaltySetting,mode:'add'|'edit' },
    public dialogRef: DialogRef,
    private dataProvider: DataProvider,
    private alertify:AlertsAndNotificationsService
  ) {
    // now add every missing category from main categories and view categories
    this.data.menu.mainCategories.forEach((mainCategory) => {
      if (!mainCategory.name) {
        return;
      }
      this.usableMainCategories.push({
        categoryName: mainCategory.name,
        categoryId: mainCategory.id,
        categoryType: 'main',
        products: mainCategory.products.map((product) => {
          return {
            productName: product.name,
            id: product.id,
            price: product.price,
            loyaltyRate: 0,
            loyaltyCost: 0,
          };
        }),
      });
      if(this.data?.loyaltySetting){
        this.addNewLoyaltyForm.patchValue(this.data?.loyaltySetting);

        // update usableMainCategories with this.data?.loyaltySetting.categoryWiseRates
        this.data.loyaltySetting.categoryWiseRates.forEach((category)=>{
          let index = this.usableMainCategories.findIndex((cat)=>cat.categoryId == category.categoryId);
          if(index != -1){
            // search through every product and update only if found
            category.products.forEach((product)=>{
              let productIndex = this.usableMainCategories[index].products.findIndex((prod)=>prod.id == product.id);
              if(productIndex != -1){
                this.usableMainCategories[index].products[productIndex].loyaltyRate = product.loyaltyRate;
                this.usableMainCategories[index].products[productIndex].loyaltyCost = product.loyaltyCost;
              }
            })
          }
        })
      }
    });
  }

  addNewLoyaltyForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    baseRate: new FormControl('', Validators.required),
    expiryDays: new FormControl('', Validators.required),
    conversionRate: new FormControl('', Validators.required),
  });

  prevBaseRateValue: number = 0;
  usableMainCategories: CategoryLoyaltyRate[] = [];

  ngOnInit(): void {
    if(this.data.mode == 'edit'){
      this.addNewLoyaltyForm.controls.baseRate.disable();
    }
  }

  submit() {
    if (this.addNewLoyaltyForm.invalid) {
      this.alertify.presentToast('Please fill all the fields', 'error');
      return;
    }
    this.dialogRef.close({
      ...this.addNewLoyaltyForm.value,
      categoryWiseRates: this.usableMainCategories,
      creationDate: Timestamp.now(),
      addedBy: this.dataProvider.currentUser.username,
    });
  }

  setLoyaltyCost(product) {
    product.loyaltyCost =
      product.loyaltyRate / this.addNewLoyaltyForm.value.conversionRate;
  }

  setBaseLoyaltyPoint(value: number | null | string) {
    if (value && typeof Number(value) == 'number') {
      if(Number(value) < 0){
        value = 0;
        this.alertify.presentToast('Base rate cannot be negative','error');
        return;
      }
      this.usableMainCategories.forEach((category) => {
        category.products.forEach((prod) => {
          if (
            !prod.loyaltyRate ||
            prod.loyaltyRate == 0 ||
            prod.loyaltyRate == this.prevBaseRateValue
          ) {
            prod.loyaltyRate = Number(value);
          }
        });
      });
      this.prevBaseRateValue = Number(value);
    }
  }

  calculateLoyaltyCost(value: number | null | string) {
    if (value && typeof Number(value) == 'number') {
      this.usableMainCategories.forEach((category) => {
        category.products.forEach((prod) => {
          prod.loyaltyCost = prod.loyaltyRate / Number(value);
        });
      });
    }
  }
}
