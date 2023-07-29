import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryLoyaltyRate } from '../../../../../types/loyalty.structure';
import { ModeConfig } from '../../../../../core/constructors/menu/menu';
import { Timestamp } from '@angular/fire/firestore';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-add-loyalty-setting',
  templateUrl: './add-loyalty-setting.component.html',
  styleUrls: ['./add-loyalty-setting.component.scss']
})
export class AddLoyaltySettingComponent {
  constructor(@Inject(DIALOG_DATA) private data:{menu:ModeConfig},public dialogRef:DialogRef,private dataProvider:DataProvider){
    // this.data.menu.loyaltySettings.forEach((setting)=>{
    //   setting.categoryWiseRates.forEach((category)=>{
    //     let usableCategory:CategoryLoyaltyRate = {
    //       categoryName:category.categoryName,
    //       categoryId:category.categoryId,
    //       categoryType:category.categoryType,
    //       products:[]
    //     };
    //     if (category.categoryType === 'main'){
    //       // find main category matching this id then add every product that is not available in this category
    //       let mainCategory = this.data.menu.mainCategories.find((mainCategory)=>mainCategory.id === category.categoryId);
    //       mainCategory.products.forEach((product)=>{
    //         if (!category.products.find((categoryProduct)=>categoryProduct.id === product.id)){
    //           usableCategory.products.push({
    //             productName:product.name,
    //             id:product.id,
    //             price:product.price,
    //             loyaltyRate:0
    //           });
    //         }
    //       })
    //     } else {
    //       // find view category matching this id then add every product that is not available in this category
    //       let viewCategory = this.data.menu.viewCategories.find((viewCategory)=>viewCategory.id === category.categoryId);
    //       viewCategory.products.forEach((product)=>{
    //         if (!category.products.find((categoryProduct)=>categoryProduct.id === product.id)){
    //           usableCategory.products.push({
    //             productName:product.name,
    //             id:product.id,
    //             price:product.price,
    //             loyaltyRate:0
    //           });
    //         }
    //       })
    //     }
    //     console.log("Usable Category",usableCategory);
    //     // added the usable category with unused products
    //     if(usableCategory.products.length > 0){
    //       this.usableMainCategories.push(usableCategory);
    //     }
    //   });
    // });
    // now add every missing category from main categories and view categories
    this.data.menu.mainCategories.forEach((mainCategory)=>{
      if (!mainCategory.name){
        return
      }
      this.usableMainCategories.push({
        categoryName:mainCategory.name,
        categoryId:mainCategory.id,
        categoryType:'main',
        products:mainCategory.products.map((product)=>{
          return {
            productName:product.name,
            id:product.id,
            price:product.price,
            loyaltyRate:0,
            loyaltyCost:0
          }
        })
      });
    });
  }

  addNewLoyaltyForm:FormGroup = new FormGroup({
    name:new FormControl('',Validators.required),
    baseRate:new FormControl('',Validators.required),
    expiryDays:new FormControl('',Validators.required),
    conversionRate:new FormControl('',Validators.required),
  });

  prevBaseRateValue:number = 0;
  usableMainCategories:CategoryLoyaltyRate[] = []

  submit(){
    this.dialogRef.close({
      ...this.addNewLoyaltyForm.value,
      categoryWiseRates:this.usableMainCategories,
      creationDate:Timestamp.now(),
      addedBy:this.dataProvider.currentUser.username
    })
  }

  setLoyaltyCost(product){
    product.loyaltyCost = (product.loyaltyRate / this.addNewLoyaltyForm.value.conversionRate)
  }

  setBaseLoyaltyPoint(value:number|null|string){
    if(value && typeof Number(value) == 'number'){
      this.usableMainCategories.forEach((category)=>{
        category.products.forEach((prod)=>{
          if(!prod.loyaltyRate || prod.loyaltyRate == 0 || prod.loyaltyRate == this.prevBaseRateValue){
            prod.loyaltyRate = Number(value);
          }
        })
      })
      this.prevBaseRateValue = Number(value);
    }
  }

  calculateLoyaltyCost(value:number|null|string){
    if(value && typeof Number(value) == 'number'){
      this.usableMainCategories.forEach((category)=>{
        category.products.forEach((prod)=>{
          prod.loyaltyCost = prod.loyaltyRate / Number(value);
        })
      })
    }
  }

}
