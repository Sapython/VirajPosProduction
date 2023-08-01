import { Timestamp } from '@angular/fire/firestore';
import { Product } from '../../../types/product.structure';
import { KotConstructor } from '../../../types/kot.structure';
import { UserConstructor } from '../../../types/user.structure';
import { ApplicableCombo } from '../comboKot/comboKot';
import {
  ApplicableComboConstructor,
  ComboProductSelection,
} from '../../../types/combo.structure';
import { Bill } from '../bill';

export class Kot implements KotConstructor {
  id?: string;
  createdDate: Timestamp;
  unmade?: boolean;
  stage: 'active' | 'finalized' | 'cancelled' | 'edit';
  products: (Product | ApplicableCombo)[];
  mode;
  user: UserConstructor;
  editMode: boolean;
  selected: boolean;
  allSelected: boolean;
  cancelReason?: {
    reason: string;
    mode: 'un-made' | 'made';
    time: Timestamp;
    user: UserConstructor;
  };
  totalTimeTaken: string;
  totalTimeTakenNumber: number;
  someSelected: boolean;
  constructor(
    product: Product | ApplicableCombo,
    bill: Bill,
    kotObject?: KotConstructor,
  ) {
    this.createdDate = Timestamp.now();
    this.stage = 'active';
    this.id = 'new';
    if (kotObject) {
      this.id = kotObject.id;
      // this.products = kotObject.products;
      // loop through products and convert them to product objects or ApplicableCombo objects
      this.products = kotObject.products.map((product) => {
        if (product.itemType == 'product') {
          return product;
        } else {
          return ApplicableCombo.fromObject(product, bill);
        }
      });
      this.user = kotObject.user;
      this.editMode = kotObject.editMode;
      this.selected = kotObject.selected;
      this.allSelected = kotObject.allSelected;
      this.someSelected = kotObject.someSelected;
      this.createdDate = kotObject.createdDate;
      this.stage = kotObject.stage;
      this.totalTimeTakenNumber = 0;
      this.totalTimeTaken = '0h 0m 0s';
      this.unmade = kotObject.unmade || null;
      this.cancelReason = kotObject.cancelReason || null;
      this.user = kotObject.user || null;
    } else {
      this.products = [product];
      this.editMode = false;
      this.selected = false;
      this.totalTimeTakenNumber = 0;
      this.totalTimeTaken = '0h 0m 0s';
      this.allSelected = false;
      this.someSelected = false;
      this.user = {
        access: bill.dataProvider.currentAccessLevel,
        username: bill.dataProvider.currentUser.username,
      };
    }
    this.toObject = this.toObject.bind(this);
    this.calculateTotalTimeTaken();
  }

  selectAll(event: any) {
    const value = event.checked;
    this.products.forEach((item) => (item.selected = value));
  }
  checkAll() {
    this.allSelected = this.products.every((item) => item.selected);
    this.someSelected =
      this.products.some((item) => item.selected) && !this.allSelected;
  }

  convertProductsToObject(): (Product | ApplicableComboConstructor)[] {
    return this.products
      .map((product) => {
        if (product.itemType == 'product') {
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            type: product.type,
            category: product.category,
            itemType: product.itemType,
            tags: product.tags || [],
            quantity: product.quantity,
            variants: product.variants || [],
            selected: product.selected,
            images: product.images || [],
            createdDate: product.createdDate,
            visible: product.visible,
            lineDiscount: product.lineDiscount || null,
            sales: product.sales || 0,
            instruction: product.instruction || null,
            order: product.order || null,
            taxedPrice: product.taxedPrice || null,
            untaxedValue: product.untaxedValue || null,
            taxes: product.taxes || [],
          };
        } else if (product.itemType == 'combo') {
          let comboData = product.toObject();
          return comboData;
        }
      })
      .flat();
  }

  getAllProducts(): Product[] {
    let products = [];
    this.products.forEach((product) => {
      if (product.itemType == 'product') {
        products.push(product);
      } else if (product.itemType == 'combo') {
        product.productSelection.forEach((item) => {
          item.products.forEach((product) => {
            products.push(product);
          });
        });
      }
    });
    // remove duplicates by adding quantity
    products = products.reduce((acc, current) => {
      const x = acc.find((item) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        x.quantity += current.quantity;
        return acc;
      }
    }, []);
    return products;
  }

  getTime(date: Timestamp) {
    let milliseconds = new Date().getTime() - date.toDate().getTime();
    // convert milliseconds to minutes and seconds
    let minutes = Math.floor(milliseconds / 60000);
    let seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return minutes + ':' + (Number(seconds) < 10 ? '0' : '') + seconds;
  }

  calculateTotalTimeTaken() {
    setInterval(() => {
      let time = this.getTime(this.createdDate);
      this.totalTimeTaken = time;
      this.totalTimeTakenNumber =
        Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
    }, 1000);
  }

  toObject() {
    return {
      id: this.id,
      createdDate: this.createdDate,
      products: this.convertProductsToObject(),
      stage: this.stage,
      selected: this.selected,
      allSelected: this.allSelected,
      editMode: this.editMode,
      someSelected: this.someSelected,
      unmade: this.unmade || null,
      cancelReason: this.cancelReason || null,
      user: this.user,
    };
  }
}
