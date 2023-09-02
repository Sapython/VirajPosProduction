import { Timestamp } from '@angular/fire/firestore';
import { Bill } from '..';
import { CategoryLoyaltyRate } from '../../../../types/loyalty.structure';
import { Product } from '../../../../types/product.structure';
import { ApplicableCombo } from '../../comboKot/comboKot';

export function calculateLoyalty(
  this: Bill,
  products: (Product | ApplicableCombo)[],
) {
  let loyaltySetting = this.currentModeConfig.loyaltySettings.find(
    (loyaltySetting) =>
      this.currentModeConfig.selectedLoyaltyId == loyaltySetting.id,
  );
  if (loyaltySetting) {
    let totalLoyaltyCost = 0;
    let totalLoyaltyPoints = 0;
    products.forEach((product) => {
      if (product.itemType == 'product') {
        let rate = getRate(product, loyaltySetting.categoryWiseRates);
        product.loyaltyCost = rate.cost;
        product.loyaltyPoints = rate.points;
        totalLoyaltyCost += rate.cost;
        totalLoyaltyPoints += rate.points;
      } else {
        product.combo.selectedCategories.forEach((category) => {
          if (category.selectedProducts){
            category.selectedProducts.forEach((product) => {
              if (category.offerType == 'loyalty'){
                let rate = category.amount;
                product.loyaltyCost = loyaltySetting.baseRate * product.quantity;
                product.loyaltyPoints = category.amount;
                totalLoyaltyCost += loyaltySetting.baseRate * product.quantity;
                totalLoyaltyPoints += category.amount;
              } else {
                let rate = getRate(product, loyaltySetting.categoryWiseRates);
                product.loyaltyCost = rate.cost;
                product.loyaltyPoints = rate.points;
                totalLoyaltyCost += rate.cost;
                totalLoyaltyPoints += rate.points;
              }
            });
          }
        });
      }
    });
    this.currentLoyalty.loyaltySettingId = loyaltySetting.id;
    this.currentLoyalty.totalLoyaltyCost = totalLoyaltyCost;
    this.currentLoyalty.totalLoyaltyPoints = totalLoyaltyPoints;
    let today = new Date();
    // add loyaltySetting.expiryDays to today
    today.setDate(today.getDate() + loyaltySetting.expiryDays);
    this.currentLoyalty.expiryDate = Timestamp.fromDate(today);
  }
}

function getRate(product: Product, loyaltySetting: CategoryLoyaltyRate[]) {
  // find category that has this product id and return the loyalty rate
  let category = loyaltySetting.find((category) =>
    category.products.find(
      (categoryProduct) => categoryProduct.id === product.id,
    ),
  );
  if (category) {
    let foundSetting = category.products.find(
      (categoryProduct) => categoryProduct.id === product.id,
    );
    if (foundSetting){
      return {
        cost: foundSetting.loyaltyCost * product.quantity,
        points: foundSetting.loyaltyRate * product.quantity,
      };
    }
  }
  return {
    cost: 0,
    points: 0,
  };
}
