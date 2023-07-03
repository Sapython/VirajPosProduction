import { Product } from '../../../types/product.structure';
import {
  ApplicableComboConstructor,
  Combo,
  ComboCategoryCategorized,
  ComboProductSelection,
  ComboTypeProductWiseCategorized,
  TimeGroup,
} from '../../../types/combo.structure';
import { DataProvider } from '../../services/provider/data-provider.service';
import { DirectFlatDiscount, DirectPercentDiscount } from '../../../types/discount.structure';
import { Tax } from '../../../types/tax.structure';
import { Timestamp } from '@angular/fire/firestore';
import { Bill } from '../bill';

export class ApplicableCombo implements ApplicableComboConstructor {
  itemType: 'combo' = 'combo';
  id: string;
  combo: Combo;
  selected: boolean;
  productSelection: ComboProductSelection[] = [];
  quantity: number = 1;
  price: number = 0;
  cancelled: boolean;
  name: string;
  instruction: string;
  transferred?: string;
  incomplete: boolean = false;
  canBeDiscounted: boolean = false;
  canBeApplied: boolean = false;
  untaxedValue: number = 0;
  lineDiscount?: DirectPercentDiscount | DirectFlatDiscount;
  lineDiscounted: boolean = false;
  totalAppliedTax: number = 0;
  totalAppliedPercentage: number = 0;
  finalTaxes: Tax[] = [];
  days:string[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ]
  constructor(combo: Combo, bill:Bill) {
    this.generateId();
    if (this.checkDateIsAvailable(combo.timeGroups)) {
      this.canBeApplied = true;
    } else {
      alert('Combo cannot be applied. Please check the validity of the combo.');
    }
    this.name = combo.name;
    this.combo = structuredClone(combo);
    this.canBeDiscounted = this.combo.discounted;
    this.selected = false;
    this.calculatePrice();
  }

  addProduct(
    type: ComboTypeProductWiseCategorized,
    category: ComboCategoryCategorized,
    product: Product
  ) {
    // check if type, category, product exists in combo
    const comboType = this.combo.types.find((t) => t.id == type.id);
    const comboCategory = comboType?.categories.find(
      (c) => c.id == category.id
    );
    const comboProduct = comboCategory?.products.find(
      (p) => p.id == product.id
    );
    if (comboProduct) {
      // check if product is already added
      if (!comboCategory.selectedProducts) {
        comboCategory.selectedProducts = [];
      }
      let totalQuantity = comboCategory.selectedProducts.reduce(
        (a, b) => a + (b.quantity || 1),
        0
      );
      if (
        (comboCategory.maximumProducts || comboCategory.minimumProducts) &&
        (totalQuantity >=
          Number(
            comboCategory.maximumProducts || comboCategory.minimumProducts
          ) ||
          comboCategory.selectedProducts.length >=
            comboCategory.minimumProducts)
      ) {
        alert('Cannot add more products to this category.');
        return;
      }
      let productIndex = comboCategory.selectedProducts.findIndex(
        (p) => p.id == product.id
      );
      if (productIndex != -1) {
        comboCategory.selectedProducts[productIndex].quantity++;
      } else {
        console.log('adding product to combo', product.name);
        comboCategory.selectedProducts.push({ ...product, quantity: 1 });
      }
    }
    this.calculatePrice();
  }

  increaseQuantity() {
    this.quantity++;
    this.calculatePrice();
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
      this.calculatePrice();
    }
  }

  setQuantity(quantity: number) {
    this.quantity = quantity;
    this.calculatePrice();
  }

  increaseProductQuantity(
    type: ComboTypeProductWiseCategorized,
    category: ComboCategoryCategorized,
    product: Product
  ) {
    const comboType = this.combo.types.find((t) => t.id == type.id);
    const comboCategory = comboType?.categories.find(
      (c) => c.id == category.id
    );
    const comboProduct = comboCategory?.products.find(
      (p) => p.id == product.id
    );
    if (comboProduct) {
      let productIndex = comboCategory.selectedProducts.findIndex(
        (p) => p.id == product.id
      );
      if (productIndex != -1) {
        if (
          comboCategory.selectedProducts.length <=
            (comboCategory.maximumProducts || comboCategory.minimumProducts) &&
          comboCategory.selectedProducts.length >=
            (comboCategory.minimumProducts || 0)
        ) {
          comboCategory.selectedProducts.splice(productIndex, 1);
        } else {
          alert('Cannot add more products to this category.');
        }
      }
    }
  }

  decreaseProductQuantity(
    type: ComboTypeProductWiseCategorized,
    category: ComboCategoryCategorized,
    product: Product
  ) {
    const comboType = this.combo.types.find((t) => t.id == type.id);
    const comboCategory = comboType?.categories.find(
      (c) => c.id == category.id
    );
    const comboProduct = comboCategory?.products.find(
      (p) => p.id == product.id
    );
    if (comboProduct) {
      let productIndex = comboCategory.selectedProducts.findIndex(
        (p) => p.id == product.id
      );
      if (productIndex != -1) {
        if (
          comboCategory.selectedProducts.length <=
            (comboCategory.maximumProducts || comboCategory.minimumProducts) &&
          comboCategory.selectedProducts.length >=
            (comboCategory.minimumProducts || 0)
        ) {
          comboCategory.selectedProducts.splice(productIndex, 1);
        } else {
          alert('Cannot add more products to this category.');
        }
      }
    }
  }

  setProductQuantity(
    type: ComboTypeProductWiseCategorized,
    category: ComboCategoryCategorized,
    product: Product,
    quantity: number
  ) {
    const comboType = this.combo.types.find((t) => t.id == type.id);
    const comboCategory = comboType?.categories.find(
      (c) => c.id == category.id
    );
    const comboProduct = comboCategory?.products.find(
      (p) => p.id == product.id
    );
    if (comboProduct) {
      let productIndex = comboCategory.selectedProducts.findIndex(
        (p) => p.id == product.id
      );
      if (productIndex != -1) {
        if (
          comboCategory.selectedProducts.length <=
            (comboCategory.maximumProducts || comboCategory.minimumProducts) &&
          comboCategory.selectedProducts.length >=
            (comboCategory.minimumProducts || 0)
        ) {
          comboCategory.selectedProducts.splice(productIndex, 1);
        } else {
          alert('Cannot add more products to this category.');
        }
      }
    }
  }

  deleteProduct(
    type: ComboTypeProductWiseCategorized,
    category: ComboCategoryCategorized,
    product: Product
  ) {
    const comboType = this.combo.types.find((t) => t.id == type.id);
    const comboCategory = comboType?.categories.find(
      (c) => c.id == category.id
    );
    const comboProduct = comboCategory?.products.find(
      (p) => p.id == product.id
    );
    if (comboProduct) {
      let productIndex = comboCategory.selectedProducts.findIndex(
        (p) => p.id == product.id
      );
      comboCategory.selectedProducts.splice(productIndex, 1);
    } else {
      alert('Product not found in combo.');
    }
  }

  generateId() {
    this.id = (Math.random() * 100000000000000000).toString(16);
  }

  calculatePrice() {
    this.price = 0;
    this.incomplete = false;
    this.untaxedValue = 0;
    let allProducts: Product[] = [];
    // calculate price for the whole combo and check if the combo config is incomplete
    this.combo.types.forEach((type) => {
      type.categories.forEach((category) => {
        if (!category.selectedProducts){
          // console.log('no selected products');
          this.incomplete = true;
          return
        }
        let totalQuantity = category.selectedProducts.reduce(
          (a, b) => a + (b.quantity || 1),
          0
        );
        if (totalQuantity == 0) {
          this.incomplete = true;
          this.price = 0;
        }
        // if minimum products is available then check if the selected products length is greater than minimum products
        // and if maximum products is available then check if the selected products length is less than maximum products
        if (
          (category.minimumProducts &&
            totalQuantity < category.minimumProducts) ||
          (category.maximumProducts &&
            totalQuantity > category.maximumProducts)
        ) {
          // console.log("Incomplete by length",totalQuantity);
          this.incomplete = true;
        }
        // write better version of this where we incorporate combo offer 
        // if combo offer type (this.combo.type) is combo then the price is combo.offerValue
        // if combo offer type (this.combo.type) is free then don't calculate price combo.offerValue number of items in where products are sorted in increasing order of price
        let normalizedSelectedProducts: Product[] = [];
        if (category.offerType == 'free'){
          category.selectedProducts.forEach((product) => {
            console.log("DIS",product);
            
            if (product.quantity > 1){
              for (let index = 0; index < product.quantity; index++) {
                normalizedSelectedProducts.push(structuredClone({...product,quantity:1}));
              }
            } else {
              normalizedSelectedProducts.push(structuredClone(product));
            }
          })
        }
        console.log("normalizedSelectedProducts",normalizedSelectedProducts);
        normalizedSelectedProducts.sort((a,b) => a.price - b.price);
        let totalAppliedFreeProducts: number = 0;
        normalizedSelectedProducts.forEach((product) => {
          // console.log("item index",item);
          if (product.cancelled){
            return;
          }
          if (category.offerType == 'free'){
            if (totalAppliedFreeProducts < category.offerValue){
              totalAppliedFreeProducts++;
              product.lineDiscount = {
                creationDate: Timestamp.now(),
                mode: 'directPercent',
                totalAppliedDiscount:100,
                reason: 'Combo Offer',
                value: 100,
              }
            }
          } else {
            product.lineDiscount = undefined;
          }
          allProducts.push(structuredClone(product));
        })
      });
    })
    // console.log("FINAL allProducts",allProducts);
    // check individual product for tax and if the tax.mode is inclusive then add the applicable tax to totalTaxValue or if the tax.mode is exclusive then decrease the price of product by tax rate and add the applicableValue to totalTaxValue
    let finalAdditionalTax: number = 0;
    let finalTaxes: Tax[] = [];
    let modifiedAllProducts = [];
    console.log("ALL products",allProducts);
    allProducts.forEach((product) => {
      if (product.itemType == 'product' && product.taxes) {
        // console.log('product taxes', product.taxes);
        let inclusive = product.taxes.find((tax) => tax.nature === 'inclusive')
          ? true
          : false;
        // console.log('Mode', inclusive);
        // console.log("product.price * product.quantity",product.price * product.quantity,product.price,product.quantity);
        let totalAmount = product.price * product.quantity;
        if (product.lineDiscount) {
          // console.log("Applying linediscount",product.name,product.lineDiscount);
          if (product.lineDiscount.mode === 'directPercent') {
            totalAmount = totalAmount - ((totalAmount / 100) * product.lineDiscount.value);
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
        // console.log("TAX TYPE",inclusive,totalAmount);
        if (inclusive) {
          product.untaxedValue = totalAmount - applicableTax;
          finalAdditionalTax += additionalTax;
          // console.log('inclusive', product.untaxedValue);
        } else {
          product.untaxedValue = totalAmount;
          finalAdditionalTax += additionalTax;
          // console.log('exclusive', product.untaxedValue);
        }
        product.taxedValue = totalAmount;
        product.applicableTax = applicableTax + additionalTax;
        // add product to modifiedAllProducts if it already exists increase quantity or else add it and also add it when the product is lineDiscounted
        let index = modifiedAllProducts.findIndex(
          (item) => item.id === product.id
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
      }
    });
    console.log("ALL products 2",allProducts);
    // calculate price
    allProducts.forEach((product) => {
      this.untaxedValue = this.untaxedValue + (product.untaxedValue * product.quantity);
      console.log("PRD",product.untaxedValue,product.price,product.quantity);
      this.price = this.price + (product.price * product.quantity);
    });
    console.log("untaxedValue",this.untaxedValue,"finalTaxes",finalTaxes);
    // console.log("Price",this.price);
    // console.log("allProducts,finalTaxes,finalAdditionalTax",allProducts,finalTaxes,finalAdditionalTax);
    // this.bill.calculateBill();
  }

  checkDateIsAvailable(timeGroups: TimeGroup[]) {
    let available = true;
    timeGroups.forEach((timeGroup) => {
      timeGroup.conditions.forEach((condition) => {
        if (condition.type == 'date') {
          if (condition.condition == 'is') {
            if (condition.value != new Date().toISOString().split('T')[0]) {
              available = false;
            }
          } else if (condition.condition == 'is not') {
            if (condition.value == new Date().toISOString().split('T')[0]) {
              available = false;
            }
          } else if (condition.condition == 'is before') {
            if (condition.value >= new Date().toISOString().split('T')[0]) {
              available = false;
            }
          } else if (condition.condition == 'is after') {
            if (condition.value <= new Date().toISOString().split('T')[0]) {
              available = false;
            }
          }
        } else if (condition.type == 'day') {
          console.log("IS day");
          if (condition.condition == 'is') {
            console.log("IS day",condition.value,new Date().getDay());
            if (!condition.value.includes(this.getDayFromIndex(new Date().getDay()))) {
              available = false;
            }
          } else if (condition.condition == 'is not') {
            if (!condition.value.includes(this.getDayFromIndex(new Date().getDay()))) {
              available = false;
            }
          } else if (condition.condition == 'is before') {
            if (!condition.value.includes(this.getDayFromIndex(new Date().getDay()))) {
              available = false;
            }
          } else if (condition.condition == 'is after') {
            if (!condition.value.includes(this.getDayFromIndex(new Date().getDay()))) {
              available = false;
            }
          }
        } else if (condition.type == 'time') {
          if (condition.condition == 'is') {
            if (condition.value != new Date().getHours()) {
              available = false;
            }
          } else if (condition.condition == 'is not') {
            if (condition.value == new Date().getHours()) {
              available = false;
            }
          } else if (condition.condition == 'is before') {
            if (condition.value >= new Date().getHours()) {
              available = false;
            }
          } else if (condition.condition == 'is after') {
            if (condition.value <= new Date().getHours()) {
              available = false;
            }
          }
        }
      });
    });
    console.log("IS DAY VALID",available);
    return available;
  }

  getDayFromIndex(dayIndex:number){
    return this.days[dayIndex];
  }
}