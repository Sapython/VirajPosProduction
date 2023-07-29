import { Bill } from "..";
import { CategoryLoyaltyRate } from "../../../../types/loyalty.structure";
import { Product } from "../../../../types/product.structure";
import { ApplicableCombo } from "../../comboKot/comboKot";

export function calculateLoyalty(this:Bill,products:(Product|ApplicableCombo)[]){
	let loyaltySetting = this.currentModeConfig.loyaltySettings.find((loyaltySetting)=>this.currentModeConfig.selectedLoyaltyId == loyaltySetting.id);
	console.log("loyaltySetting",loyaltySetting,products);
	if (loyaltySetting){
		let totalLoyaltyCost = 0;
		let totalLoyaltyPoints = 0;
		products.forEach((product)=>{
			if(product.itemType == 'product'){
				let rate = getRate(product,loyaltySetting.categoryWiseRates);
				product.loyaltyCost = rate.cost;
				product.loyaltyPoints = rate.points;
				totalLoyaltyCost += rate.cost;
				totalLoyaltyPoints += rate.points;
			} else {
				product.combo.selectedCategories.forEach((category)=>{
					category.selectedProducts.forEach((product)=>{
						let rate = getRate(product,loyaltySetting.categoryWiseRates);
						product.loyaltyCost = rate.cost;
						product.loyaltyPoints = rate.points;
						totalLoyaltyCost += rate.cost;
						totalLoyaltyPoints += rate.points;
					})
				})
			}
		});
		this.currentLoyalty.loyaltySettingId = loyaltySetting.id;
		this.currentLoyalty.totalLoyaltyCost = totalLoyaltyCost;
		this.currentLoyalty.totalLoyaltyPoints = totalLoyaltyPoints;
	};
}

function getRate(product:Product,loyaltySetting:CategoryLoyaltyRate[]){
	// find category that has this product id and return the loyalty rate
	let category = loyaltySetting.find((category)=>category.products.find((categoryProduct)=>categoryProduct.id === product.id));
	if (category){
		let foundSetting = category.products.find((categoryProduct)=>categoryProduct.id === product.id)
		return {cost:(foundSetting.loyaltyCost * product.quantity),points:(foundSetting.loyaltyRate * product.quantity)};
	}
}