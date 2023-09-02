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
  finalTaxes.forEach((tax)=>{
    if(this.nonChargeableDetail){
      tax.amount = 0;
    }
  })
  this.billing.subTotal = allProducts.reduce((acc, cur) => {
    return acc + cur.untaxedValue;
  }, 0);
  let localSubtotalForLoyalty = this.currentLoyalty.totalToBeRedeemedCost;
  // console.log("this.billing.subTotal",this.billing.subTotal);
  let applicableDiscount = 0;
  this.anyComboCanBeDiscounted();
  // console.log("bill allProducts",allProducts);
  let quantityOfProduct = this.allProducts().reduce((acc, cur) => {
    return acc + cur.quantity;
  },0)
  if(this.canBeDiscounted){
      // apply discount to subTotal
    // console.log("Starting applicable discount",applicableDiscount);
    this.billing.discount.forEach((discount) => {
      discount.totalAppliedDiscount = 0;
      if (discount.mode == 'codeBased') {
        if (discount.type === 'percentage') {
          let discountValue = Number((this.billing.subTotal / 100) * discount.value);
          // console.log("Code based percent",discountValue);
          if (discount.maximumDiscount && discountValue > discount.maximumDiscount){
            discountValue = discount.maximumDiscount;
          }
          if (discount.minimumAmount && this.billing.subTotal < discount.minimumAmount){
            discountValue = 0;
          }
          if (discount.minimumProducts && quantityOfProduct < discount.minimumProducts){
            discountValue = 0;
          }
          applicableDiscount += Number(discountValue);
          discount.totalAppliedDiscount += Number(discountValue);
        } else {
          // console.log("Code based flat",discount.value);
          let discountValue = discount.value;
          if (discount.maximumDiscount && discountValue > discount.maximumDiscount){
            discountValue = discount.maximumDiscount;
          }
          if (discount.minimumAmount && this.billing.subTotal < discount.minimumAmount){
            discountValue = 0;
          }
          if (discount.minimumProducts && quantityOfProduct < discount.minimumProducts){
            discountValue = 0;
          }
          applicableDiscount += Number(discountValue);
          discount.totalAppliedDiscount += Number(discountValue);
        }
      } else if (discount.mode == 'directFlat') {
        // console.log("Direct based flat",discount.value);
        applicableDiscount += Number(discount.value);
        discount.totalAppliedDiscount += Number(discount.value);
      } else if (discount.mode == 'directPercent') {
        let discountValue = Number((this.billing.subTotal / 100) * Number(discount.value));
        // console.log("Direct based percent",discountValue);
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
  // console.log('applicableDiscount',applicableDiscount);
  this.billing.postDiscountSubTotal = this.billing.subTotal - (this.currentLoyalty.totalToBeRedeemedCost + applicableDiscount);
  this.billing.postChargesSubTotal = this.billing.postDiscountSubTotal;
  if (!this.appliedCharges){
    this.appliedCharges = {
      containerCharge: 0,
      deliveryCharge: 0,
      tip: 0,
      serviceCharge: 0,
    }
  }
  if(this.appliedCharges.containerCharge){
    this.billing.postChargesSubTotal = this.billing.postDiscountSubTotal + this.appliedCharges.containerCharge;
  }
  if(this.appliedCharges.deliveryCharge){
    this.billing.postChargesSubTotal = this.billing.postDiscountSubTotal + this.appliedCharges.deliveryCharge;
  }
  if(this.appliedCharges.tip){
    this.billing.postChargesSubTotal = this.billing.postDiscountSubTotal + this.appliedCharges.tip;
  }
  if(this.appliedCharges.serviceCharge){
    this.billing.postChargesSubTotal = this.billing.postDiscountSubTotal + this.appliedCharges.serviceCharge;
  }
  this.billing.grandTotal = Math.ceil(this.billing.postChargesSubTotal + totalApplicableTax);
  if (this.billingMode === 'nonChargeable') {
    // this.billing.subTotal = 0;
    this.billing.grandTotal = 0;
  }
  this.printableBillData = this.getPrintableBillData(allProducts);
  // console.log("printableBillData",this.printableBillData);
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
          // console.log("Product",product);
          if (product.itemType == 'combo'){
            allProducts.push(product)
          } else {
            allProducts.push(structuredClone(product));
          }
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
          let taxFactor = 100;
          // if (tax.nature == 'inclusive'){
          //   taxFactor = 100 + tax.cost;
          // }
          let taxAmount = (totalAmount / taxFactor) * tax.cost;
          // console.log("TAX AMT:",taxAmount,product.name," nature:",tax.nature,' cost:',tax.cost);
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
          let taxAmount = tax.cost;
          applicableTax += taxAmount;
          // find tax in finalTaxes and add the taxAmount to it
          let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
          if (index !== -1) {
            finalTaxes[index].amount += taxAmount;
          } else {
            finalTaxes.push(JSON.parse(JSON.stringify(tax)));
            let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
            finalTaxes[index].amount = taxAmount;
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
            let taxAmount = tax.cost;
            additionalTax += taxAmount;
            // find tax in finalTaxes and add the taxAmount to it
            let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
            if (index !== -1) {
              finalTaxes[index].amount += taxAmount;
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
    tax.amount = roundOff(tax.amount)
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

export function roundOff(number:number){
  return Math.round((number + Number.EPSILON) * 100) / 100
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