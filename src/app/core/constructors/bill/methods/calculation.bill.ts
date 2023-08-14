import { Bill } from '..';
import { KotConstructor } from '../../../../types/kot.structure';
import { Product } from '../../../../types/product.structure';
import { Tax } from '../../../../types/tax.structure';
import { ApplicableCombo } from '../../comboKot/comboKot';
import { Kot } from '../../kot/Kot';

export function calculateBill(this: Bill, noUpdate: boolean = false) {
  // console.log("Running using calculateBill");
  // check individual product for tax and if the tax.mode is inclusive then add the applicable tax to totalTaxValue or if the tax.mode is exclusive then decrease the price of product by tax rate and add the applicableValue to totalTaxValue
  let calculationResults = calculateProducts(this.kots);
  // console.log("calculationResults",calculationResults);
  this.calculateLoyalty(calculationResults.allProducts);
  let allProducts = calculationResults.allProducts;
  let finalTaxes: Tax[] = calculationResults.finalTaxes;
  let finalAdditionalTax = calculationResults.finalAdditionalTax;
  this.billing.subTotal = allProducts.reduce((acc, cur) => {
    return acc + cur.untaxedValue;
  }, 0);
  let localSubtotalForLoyalty = this.currentLoyalty.totalToBeRedeemedCost;
  // console.log("this.billing.subTotal",this.billing.subTotal);
  let applicableDiscount = 0;
  this.anyComboCanBeDiscounted();
  // console.log("bill allProducts",allProducts);
  if(this.canBeDiscounted){
      // apply discount to subTotal
    this.billing.discount.forEach((discount) => {
      discount.totalAppliedDiscount = 0;
      if (discount.mode == 'codeBased') {
        if (discount.type === 'percentage') {
          let discountValue = (this.billing.subTotal / 100) * discount.value;
          applicableDiscount += discountValue;
          discount.totalAppliedDiscount += Number(discountValue);
        } else {
          applicableDiscount += discount.value;
          discount.totalAppliedDiscount += Number(discount.value);
        }
      } else if (discount.mode == 'directFlat') {
        applicableDiscount += discount.value;
        discount.totalAppliedDiscount += Number(discount.value);
      } else if (discount.mode == 'directPercent') {
        let discountValue = (this.billing.subTotal / 100) * discount.value;
        applicableDiscount += discountValue;
        discount.totalAppliedDiscount += Number(discountValue);
      }
    });
  } else {
    this.billing.discount = [];
  }
  
  this.billing.taxes = finalTaxes;
  let totalApplicableTax = this.billing.taxes.reduce((acc, cur) => {
    return acc + cur.amount;
  }, 0);
  // console.log('totalApplicableTax',this.billing.taxes,finalTaxes, totalApplicableTax,finalAdditionalTax);
  this.billing.postDiscountSubTotal = this.billing.subTotal - (this.currentLoyalty.totalToBeRedeemedCost + applicableDiscount);
  this.billing.grandTotal = Math.round(this.billing.postDiscountSubTotal + totalApplicableTax);
  if (this.billingMode === 'nonChargeable') {
    // this.billing.subTotal = 0;
    this.billing.grandTotal = 0;
  }
  this.printableBillData = this.getPrintableBillData(allProducts);
  this.checkCanPrintKot();
  // console.log('currentLoyalty', this.currentLoyalty);
  this.updated.next(noUpdate);
}

export function calculateProducts(kots: (Kot | KotConstructor)[]) {
  let allProducts: (Product | ApplicableCombo)[] = [];
  kots.forEach((kot) => {
    if (kot.stage === 'finalized' || kot.stage === 'active') {
      // add product or increase quantity
      kot.products.forEach((product) => {
        let item = allProducts.find((item) => item.id === product.id);
        if (product.cancelled) {
          return;
        }
        if (item) {
          item.quantity += product.quantity;
        } else {
          allProducts.push(JSON.parse(JSON.stringify(product)));
        }
      });
    }
  });

  // console.log("FINAL allProducts",allProducts,kots);

  // check individual product for tax and if the tax.mode is inclusive then add the applicable tax to totalTaxValue or if the tax.mode is exclusive then decrease the price of product by tax rate and add the applicableValue to totalTaxValue
  let finalAdditionalTax: number = 0;
  let finalTaxes: Tax[] = [];
  let modifiedAllProducts = [];
  allProducts.forEach((product) => {
    if (product.itemType == 'product' && product.taxes) {
      let inclusive = product.taxes.find((tax) => tax.nature === 'inclusive')
        ? true
        : false;
      // console.log('Mode', inclusive);
      // console.log("product.price * product.quantity",product.price * product.quantity,product.price,product.quantity);
      let totalAmount = product.price * product.quantity;
      if (product.lineDiscount) {
        // console.log("Applying linediscount",product.name,product.lineDiscount);
        if (product.lineDiscount.mode === 'directPercent') {
          totalAmount =
            totalAmount - (totalAmount / 100) * product.lineDiscount.value;
        } else {
          totalAmount = totalAmount - product.lineDiscount.value;
        }
        product.lineDiscounted = true;
      }
      let applicableTax = 0;
      product.taxes.forEach((tax) => {
        if (tax.type === 'percentage') {
          // console.log("Total amount",totalAmount);
          let taxAmount = (totalAmount * tax.cost) / 100;
          applicableTax += taxAmount; // applicableTax = applicableTax + taxAmount
          // find tax in finalTaxes and add the taxAmount to it
          let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
          if (index !== -1) {
            //  console.log('adding', taxAmount);
            finalTaxes[index].amount += taxAmount;
          } else {
            finalTaxes.push(JSON.parse(JSON.stringify(tax)));
            let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
            finalTaxes[index].amount = taxAmount;
          }
        } else {
          applicableTax += tax.cost;
          // find tax in finalTaxes and add the taxAmount to it
          let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
          if (index !== -1) {
            finalTaxes[index].amount += tax.cost;
          } else {
            finalTaxes.push(JSON.parse(JSON.stringify(tax)));
            let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
            finalTaxes[index].amount = tax.cost;
          }
        }
      });
      //  console.log("Previous tax",finalTaxes);
      let additionalTax = 0;
      finalTaxes.forEach((tax: Tax) => {
        if (tax.mode === 'bill') {
          if (tax.type === 'percentage') {
            let taxAmount = (totalAmount * tax.cost) / 100;
            additionalTax += taxAmount;
            // find tax in finalTaxes and add the taxAmount to it
            let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
            if (index !== -1) {
              //  console.log('adding', taxAmount);
              finalTaxes[index].amount += taxAmount;
            }
          } else {
            additionalTax += tax.cost;
            // find tax in finalTaxes and add the taxAmount to it
            let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
            if (index !== -1) {
              finalTaxes[index].amount += tax.cost;
            }
          }
        }
      });
      if (inclusive) {
        product.untaxedValue = totalAmount - applicableTax;
        finalAdditionalTax += additionalTax;
        //  console.log('inclusive', product.untaxedValue);
      } else {
        product.untaxedValue = totalAmount;
        finalAdditionalTax += additionalTax;
        //  console.log('exclusive', product.untaxedValue);
      }
      product.taxedValue = totalAmount;
      product.applicableTax = applicableTax + additionalTax;
      // add product to modifiedAllProducts if it already exists increase quantity or else add it and also add it when the product is lineDiscounted
      let index = modifiedAllProducts.findIndex(
        (item) => item.id === product.id,
      );
      if (index !== -1) {
        if (product.lineDiscounted) {
          modifiedAllProducts.push(JSON.parse(JSON.stringify(product)));
        } else {
          modifiedAllProducts[index].quantity += product.quantity;
        }
      } else {
        modifiedAllProducts.push(JSON.parse(JSON.stringify(product)));
      }
    } else {
      // calculation for combo
      // combo is an ApplicableCombo class
      let combo = product as ApplicableCombo;
      // console.log('combo taxes',product.name,product.id, combo.finalTaxes.map((d)=>d.id));
      // console.log("UNAPPLIED COMBO",combo);
      combo.finalTaxes.forEach((comboTax: Tax) => {
        let index = finalTaxes.findIndex(
          (item: Tax) => item.id === comboTax.id,
        );
        if (index === -1) {
          finalTaxes.push(JSON.parse(JSON.stringify(comboTax)));
        }
      });
    }
  });
  // merge all finalTaxes by mathcing their id and then adding their amount
  let groupedFinalTaxes = [];
  finalTaxes.forEach((tax: Tax) => {
    let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
    if (index !== -1) {
      let taxIndex = groupedFinalTaxes.findIndex(
        (item: Tax) => item.id === tax.id,
      );
      if (taxIndex !== -1) {
        groupedFinalTaxes[taxIndex].amount += tax.amount;
      } else {
        groupedFinalTaxes.push(JSON.parse(JSON.stringify(tax)));
      }
    } else {
      groupedFinalTaxes.push(JSON.parse(JSON.stringify(tax)));
    }
  })
  // this.checkCanPrintKot(this);
  return { allProducts, finalTaxes:groupedFinalTaxes, finalAdditionalTax };
}


export function anyComboCanBeDiscounted(this:Bill){
  let canBeDiscounted = true;
  this.kots.forEach((kot)=>{
    kot.products.forEach((product)=>{
      if(product.itemType == 'combo'){
        if(!product.canBeDiscounted){
          canBeDiscounted = false;
        }
      }
    });
  });
  // console.log("Can be discounted",this.canBeDiscounted);
  this.canBeDiscounted = canBeDiscounted;
  return canBeDiscounted;
}