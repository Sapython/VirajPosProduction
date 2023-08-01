import { Product } from '../../../types/product.structure';
import {
  ApplicableComboConstructor,
  Combo,
  ComboCategoryCategorized,
  ComboProductSelection,
  TimeGroup,
  VisibilitySettings,
} from '../../../types/combo.structure';
import {
  DirectFlatDiscount,
  DirectPercentDiscount,
} from '../../../types/discount.structure';
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
  cancelled: boolean = false;
  name: string;
  selectedProductsIds: string[] = [];
  instruction: string = '';
  transferred?: string = null;
  incomplete: boolean = false;
  canBeDiscounted: boolean = false;
  canBeApplied: boolean = false;
  untaxedValue: number = 0;
  lineDiscount?: DirectPercentDiscount | DirectFlatDiscount = null;
  lineDiscounted: boolean = false;
  totalAppliedTax: number = 0;
  totalAppliedPercentage: number = 0;
  finalTaxes: Tax[] = [];
  days: string[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  constructor(
    combo: Combo,
    private bill: Bill,
  ) {
    this.generateId();
    console.log('combo.from jadoo', combo.updateDate.toDate());
    if (
      this.checkDateIsAvailable(
        combo.visibilitySettings,
        combo.updateDate.toDate(),
      )
    ) {
      this.canBeApplied = true;
    } else {
      this.canBeApplied = false;
      alert('Combo cannot be applied. Please check the validity of the combo.');
    }
    this.name = combo.name;
    this.combo = structuredClone(combo);
    this.canBeDiscounted = this.combo.discounted;
    this.selected = false;
    this.calculatePrice();
  }

  addProduct(category: ComboCategoryCategorized, product: Product) {
    if (!this.canBeApplied) {
      alert('Not allowed combo is not available.');
      return;
    }
    // check if type, category, product exists in combo
    const comboCategory = this.combo.selectedCategories?.find(
      (c) => c.id == category.id,
    );
    const comboProduct = comboCategory?.category.products.find(
      (p) => p.id == product.id,
    );
    if (comboProduct) {
      // check if product is already added
      if (!comboCategory.selectedProducts) {
        comboCategory.selectedProducts = [];
      }
      let totalQuantity = comboCategory.selectedProducts.reduce(
        (a, b) => a + (b.quantity || 1),
        0,
      );
      console.log('Combo category', comboCategory);
      if (
        (comboCategory.maximumProducts || comboCategory.minimumProducts) &&
        (totalQuantity >=
          Number(
            comboCategory.maximumProducts || comboCategory.minimumProducts,
          ) ||
          comboCategory.selectedProducts.length >=
            comboCategory.minimumProducts)
      ) {
        alert('Cannot add more products to this category.');
        return;
      }
      let productIndex = comboCategory.selectedProducts.findIndex(
        (p) => p.id == product.id,
      );
      if (productIndex != -1) {
        comboCategory.selectedProducts[productIndex].quantity++;
      } else {
        console.log('adding product to combo', product.name);
        comboCategory.selectedProducts.push({ ...product, quantity: 1 });
      }
    } else {
      alert('Product not found in combo.');
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
    category: ComboCategoryCategorized,
    product: Product,
  ) {
    console.log('this.combo', this.combo);
    const comboCategory = this.combo?.selectedCategories.find(
      (c) => c.id == category.id,
    );
    const comboProduct = comboCategory?.category.products.find(
      (p) => p.id == product.id,
    );
    if (comboProduct) {
      let totalQuantity = comboCategory.selectedProducts.reduce(
        (a, b) => a + (b.quantity || 1),
        0,
      );
      console.log(
        'Laden',
        totalQuantity,
        comboCategory.maximumProducts || comboCategory.minimumProducts,
      );
      if (
        (comboCategory.maximumProducts || comboCategory.minimumProducts) &&
        totalQuantity >=
          Number(comboCategory.maximumProducts || comboCategory.minimumProducts)
      ) {
        alert('Cannot add more products to this category.');
        return;
      }
      product.quantity++;
    }
    this.calculatePrice();
  }

  decreaseProductQuantity(
    category: ComboCategoryCategorized,
    product: Product,
  ) {
    const comboCategory = this.combo?.selectedCategories.find(
      (c) => c.id == category.id,
    );
    const comboProduct = comboCategory?.category.products.find(
      (p) => p.id == product.id,
    );
    if (comboProduct) {
      if (product.quantity > 1) {
        product.quantity--;
      }
    }
    this.calculatePrice();
  }

  setProductQuantity(
    category: ComboCategoryCategorized,
    product: Product,
    quantity: number,
  ) {
    console.log('this.combo', this.combo);
    const comboCategory = this.combo.selectedCategories?.find(
      (c) => c.id == category.id,
    );
    const comboProduct = comboCategory?.category.products.find(
      (p) => p.id == product.id,
    );
    if (comboProduct) {
      let totalQuantity = comboCategory.selectedProducts.reduce((a, b) => {
        if (b.id == product.id) {
          return a + quantity;
        }
        return a + (b.quantity || 1);
      }, 0);
      if (
        (comboCategory.maximumProducts || comboCategory.minimumProducts) &&
        totalQuantity >
          Number(comboCategory.maximumProducts || comboCategory.minimumProducts)
      ) {
        product.quantity = 1;
        alert('Cannot add more products to this category.');
        return;
      }
      product.quantity = quantity;
    }
    this.calculatePrice();
  }

  deleteProduct(category: ComboCategoryCategorized, product: Product) {
    const comboCategory = this.combo?.selectedCategories.find(
      (c) => c.id == category.id,
    );
    const comboProduct = comboCategory?.category.products.find(
      (p) => p.id == product.id,
    );
    if (comboProduct) {
      let productIndex = comboCategory.selectedProducts.findIndex(
        (p) => p.id == product.id,
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
    this.combo.selectedCategories.forEach((category) => {
      if (!category.selectedProducts) {
        // console.log('no selected products');
        this.incomplete = true;
        return;
      }
      let totalQuantity = category.selectedProducts.reduce(
        (a, b) => a + (b.quantity || 1),
        0,
      );
      if (
        totalQuantity == 0 ||
        totalQuantity < (category.minimumProducts || 0)
      ) {
        this.incomplete = true;
        this.price = 0;
      }
      // if minimum products is available then check if the selected products length is greater than minimum products
      // and if maximum products is available then check if the selected products length is less than maximum products
      if (
        (category.minimumProducts &&
          totalQuantity < category.minimumProducts) ||
        (category.maximumProducts && totalQuantity > category.maximumProducts)
      ) {
        // console.log("Incomplete by length",totalQuantity);
        this.incomplete = true;
      }
      // if category offerType is fixedPrice then check if the appliedOn is item then replace the price of each product with the offerPrice and if appliedOn is group then replace the price of each product with the offerPrice divided by the total quantity of products in the category
      if (category.offerType == 'fixed') {
        if (category.appliedOn == 'item') {
          category.selectedProducts.forEach((product) => {
            product.price = category.amount;
          });
        } else {
          category.selectedProducts.forEach((product) => {
            product.price = category.amount / totalQuantity;
          });
        }
      } else if (category.offerType == 'free') {
        // if category offerType is free then distribute products into array.
        category.selectedProducts.forEach((product) => {
          product.lineDiscount = {
            creationDate: Timestamp.now(),
            mode: 'directPercent',
            reason: 'Free',
            totalAppliedDiscount: 0,
            value: 100,
          };
          product.lineDiscounted = true;
        });
      } else if (category.offerType == 'discount') {
        // apply this discount to all products in the category
        category.selectedProducts.forEach((product) => {
          if (category.discountType == 'flat') {
            product.lineDiscount = {
              creationDate: Timestamp.now(),
              mode: 'directFlat',
              reason: 'Discount',
              totalAppliedDiscount: 0,
              value: category.amount,
            };
          } else {
            product.lineDiscount = {
              creationDate: Timestamp.now(),
              mode: 'directPercent',
              reason: 'Discount',
              totalAppliedDiscount: 0,
              value: category.amount,
            };
          }
          product.lineDiscounted = true;
        });
      } else if (category.offerType == 'mustBuy') {
        // no price change
        category.selectedProducts.forEach((product) => {
          product.lineDiscount = null;
          product.lineDiscounted = false;
        });
      }
      allProducts = allProducts.concat(category.selectedProducts);
    });
    // console.log("FINAL allProducts",allProducts);
    // check individual product for tax and if the tax.mode is inclusive then add the applicable tax to totalTaxValue or if the tax.mode is exclusive then decrease the price of product by tax rate and add the applicableValue to totalTaxValue
    let finalAdditionalTax: number = 0;
    let finalTaxes: Tax[] = [];
    let modifiedAllProducts = [];
    this.price = 0;
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
            totalAmount =
              totalAmount - (totalAmount / 100) * product.lineDiscount.value;
            // this.price += this.price - ((this.price / 100) * product.lineDiscount.value);
          } else {
            totalAmount = totalAmount - product.lineDiscount.value;
            // this.price += this.price - product.lineDiscount.value;
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
              let index = finalTaxes.findIndex(
                (item: Tax) => item.id === tax.id,
              );
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
              let index = finalTaxes.findIndex(
                (item: Tax) => item.id === tax.id,
              );
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
              let index = finalTaxes.findIndex(
                (item: Tax) => item.id === tax.id,
              );
              if (index !== -1) {
                //  console.log('adding', taxAmount);
                finalTaxes[index].amount += taxAmount;
              }
            } else {
              additionalTax += tax.cost;
              // find tax in finalTaxes and add the taxAmount to it
              let index = finalTaxes.findIndex(
                (item: Tax) => item.id === tax.id,
              );
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
      }
    });

    // calculate price
    allProducts.forEach((product) => {
      this.untaxedValue += product.untaxedValue;
      console.log('PRD', product.untaxedValue, product.price, product.quantity);
      if (!product.lineDiscounted) {
        this.price = this.price + product.price * product.quantity;
      }
    });
    this.selectedProductsIds = allProducts.map((p) => p.id);
    this.untaxedValue = this.untaxedValue * this.quantity;
    finalTaxes.forEach((tax) => {
      // multiply tax amount with quantity
      tax.amount = tax.amount * this.quantity;
    });
    this.finalTaxes = finalTaxes;
    if (this.bill && this.bill.calculateBill) {
      this.bill.calculateBill();
    }
    console.log('untaxedValue', this.untaxedValue, 'finalTaxes', finalTaxes);
  }

  checkDateIsAvailable(visibilitySettings: VisibilitySettings, date: Date) {
    let available = true;
    if (this.combo.visibilityEnabled){
      if (visibilitySettings.mode == 'monthly') {
        if (visibilitySettings.repeating) {
          let todayYear = new Date().getFullYear();
          let comboYear = date.getFullYear();
          if (todayYear != comboYear) {
            available = false;
            return;
          }
        }
        let currentMonth = new Date().toLocaleDateString('en-US', {
          month: 'long',
        });
        let currentDay = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
        });
        let currentMonthVisibility = visibilitySettings.daysSetting.find(
          (month) => month.month == currentMonth,
        );
        let availableDays = currentMonthVisibility.days.filter((day) =>
          day.week.find(
            (week) => week.day == currentDay && week.possible && week.selected,
          ),
        );
        if (availableDays.length == 0) {
          available = false;
        } else {
          available = true;
        }
      } else if (visibilitySettings.mode == 'weekly') {
        let currentDay = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
        });
        let availableDays = visibilitySettings.daysSetting[0].days.filter((day) =>
          day.week.find(
            (week) => week.day == currentDay && week.possible && week.selected,
          ),
        );
        if (availableDays.length == 0) {
          available = false;
        } else {
          available = true;
        }
      }
      console.log('IS DAY VALID', available);
      return available;
    } else {
      return this.combo.enabled
    }
  }

  getDayFromIndex(dayIndex: number) {
    return this.days[dayIndex];
  }

  toObject(): ApplicableComboConstructor {
    return {
      itemType: 'combo',
      id: this.id,
      combo: this.combo,
      selected: this.selected,
      productSelection: this.productSelection,
      quantity: this.quantity,
      cancelled: this.cancelled,
      price: this.price,
      name: this.name,
      instruction: this.instruction,
      transferred: this.transferred,
      incomplete: this.incomplete,
      canBeDiscounted: this.canBeDiscounted,
      canBeApplied: this.canBeApplied,
      untaxedValue: this.untaxedValue,
      lineDiscount: this.lineDiscount,
      lineDiscounted: this.lineDiscounted,
      totalAppliedTax: this.totalAppliedTax,
      totalAppliedPercentage: this.totalAppliedPercentage,
      finalTaxes: this.finalTaxes,
    };
  }

  static fromObject(
    applicableCombo: ApplicableComboConstructor,
    billInstance: Bill,
  ): ApplicableCombo {
    if (applicableCombo.combo) {
      let newCombo = new ApplicableCombo(applicableCombo.combo, billInstance);
      newCombo.itemType = 'combo';
      newCombo.id = applicableCombo.id;
      newCombo.combo = applicableCombo.combo;
      newCombo.selected = applicableCombo.selected;
      newCombo.productSelection = applicableCombo.productSelection;
      newCombo.quantity = applicableCombo.quantity;
      newCombo.cancelled = applicableCombo.cancelled;
      newCombo.price = applicableCombo.price;
      newCombo.name = applicableCombo.name;
      newCombo.instruction = applicableCombo.instruction;
      newCombo.transferred = applicableCombo.transferred;
      newCombo.incomplete = applicableCombo.incomplete;
      newCombo.canBeDiscounted = applicableCombo.canBeDiscounted;
      newCombo.canBeApplied = applicableCombo.canBeApplied;
      newCombo.untaxedValue = applicableCombo.untaxedValue;
      newCombo.lineDiscount = applicableCombo.lineDiscount;
      newCombo.lineDiscounted = applicableCombo.lineDiscounted;
      newCombo.totalAppliedTax = applicableCombo.totalAppliedTax;
      newCombo.totalAppliedPercentage = applicableCombo.totalAppliedPercentage;
      newCombo.finalTaxes = applicableCombo.finalTaxes;
      return newCombo;
    }
  }
}
