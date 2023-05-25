import { Bill } from '..';
import { Tax } from '../../../../types/tax.structure';

export function calculateBill(this: Bill, noUpdate: boolean = false) {
  if (this.billingMode === 'nonChargeable') {
    this.billing.subTotal = 0;
    this.billing.grandTotal = 0;
    this.updated.next(noUpdate);
    return;
  }
  let allProducts: any[] = [];
  this.kots.forEach((kot) => {
    if (kot.stage === 'finalized' || kot.stage === 'active') {
      // add product or increase quantity
      kot.products.forEach((product) => {
        let item = allProducts.find((item) => item.id === product.id);
        if (item) {
          item.quantity += product.quantity;
        } else {
          allProducts.push(
            JSON.parse(
              JSON.stringify({ ...product, quantity: product.quantity })
            )
          );
        }
      });
    }
  });

  // check individual product for tax and if the tax.mode is inclusive then add the applicable tax to totalTaxValue or if the tax.mode is exclusive then decrease the price of product by tax rate and add the applicableValue to totalTaxValue
  let finalTaxes: Tax[] = [];
  this.modifiedAllProducts = [];
  allProducts.forEach((product) => {
    if (product.taxes) {
      console.log('product taxes', product.taxes);
      let inclusive = product.taxes.find((tax) => tax.nature === 'inclusive')
        ? true
        : false;
      console.log('Mode', inclusive);
      let applicableDiscount = 0;
      let totalAmount = product.price * product.quantity;
      let applicableTax = 0;
      product.taxes.forEach((tax) => {
        if (tax.type === 'percentage') {
          let taxAmount = (totalAmount * tax.cost) / 100;
          applicableTax += taxAmount;
          // find tax in finalTaxes and add the taxAmount to it
          let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
          if (index !== -1) {
            console.log('adding', taxAmount);
            finalTaxes[index].amount += taxAmount;
          }
        } else {
          applicableTax += tax.cost;
          // find tax in finalTaxes and add the taxAmount to it
          let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
          if (index !== -1) {
            finalTaxes[index].amount += tax.cost;
          }
        }
      });
      let additionalTax = 0;
      finalTaxes.forEach((tax: Tax) => {
        if (tax.mode === 'bill') {
          if (tax.type === 'percentage') {
            let taxAmount = (totalAmount * tax.cost) / 100;
            additionalTax += taxAmount;
            // find tax in finalTaxes and add the taxAmount to it
            let index = finalTaxes.findIndex((item: Tax) => item.id === tax.id);
            if (index !== -1) {
              console.log('adding', taxAmount);
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
        product.untaxedValue = totalAmount - applicableTax + additionalTax;
        console.log('inclusive', product.untaxedValue);
      } else {
        product.untaxedValue = totalAmount + additionalTax;
        console.log('exclusive', product.untaxedValue);
      }
      if (product.lineDiscount) {
        if (product.lineDiscount.type === 'percentage') {
          applicableDiscount = product.lineDiscount.value;
        } else {
          applicableDiscount =
            (product.lineDiscount.value / product.untaxedValue) * 100;
        }
        product.lineDiscounted = true;
      }
      this.billing.discount.forEach((discount) => {
        if (discount.mode == 'codeBased') {
          if (discount.type === 'percentage') {
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
      });
      product.taxedValue = totalAmount;
      product.discountedValue = product.untaxedValue - applicableDiscount;
      product.taxedDiscountedValue =
        product.untaxedValue - applicableDiscount + applicableTax;
      product.applicableTax = applicableTax;
      product.applicableDiscount = applicableDiscount;
      // add product to modifiedAllProducts if it already exists increase quantity or else add it and also add it when the product is lineDiscounted
      let index = this.modifiedAllProducts.findIndex(
        (item) => item.id === product.id
      );
      if (index !== -1) {
        if (product.lineDiscounted) {
          this.modifiedAllProducts.push(JSON.parse(JSON.stringify(product)));
        } else {
          this.modifiedAllProducts[index].quantity += product.quantity;
        }
      } else {
        this.modifiedAllProducts.push(JSON.parse(JSON.stringify(product)));
      }
    }
  });

  console.log(
    'allProducts',
    allProducts,
    'modifiedAllProducts',
    this.modifiedAllProducts,
    'kots',
    this.kots
  );

  // this.modifiedAllProducts = JSON.parse(JSON.stringify(allProducts));

  this.billing.subTotal = allProducts.reduce((acc, cur) => {
    return acc + cur.untaxedValue;
  }, 0);

  this.billing.taxes = finalTaxes.filter((tax) => tax.amount > 0);
  this.billing.grandTotal = allProducts.reduce((acc, cur) => {
    return acc + cur.taxedDiscountedValue;
  }, 0);
  console.log(
    this.billing,
    'all products',
    allProducts,
    'discounted',
    this.billing.discount,
    'final taxes',
    finalTaxes
  );
  this.updated.next();
}
