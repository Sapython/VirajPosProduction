import { Timestamp } from '@angular/fire/firestore';
import { KotConstructor, Product } from './constructors';

export class Kot {
  id: string;
  createdDate: Timestamp;
  stage: 'active' | 'finalized' | 'cancelled' | 'edit';
  products: Product[];
  editMode: boolean;
  selected: boolean;
  allSelected: boolean;
  totalTimeTaken: string;
  totalTimeTakenNumber: number;
  someSelected: boolean;
  constructor(id: string, product: Product,kotObject?:KotConstructor) {
    this.id = id;
    this.createdDate = Timestamp.now();
    this.stage = 'active';
    if(kotObject){
      this.products = kotObject.products;
      this.editMode = kotObject.editMode;
      this.selected = kotObject.selected;
      this.allSelected = kotObject.allSelected;
      this.someSelected = kotObject.someSelected;
      this.createdDate = kotObject.createdDate;
      this.stage = kotObject.stage;
      this.totalTimeTakenNumber = 0;
      this.totalTimeTaken = '0h 0m 0s';
    } else {
      this.products = [product];
      this.editMode = false;
      this.selected = false;
      this.totalTimeTakenNumber = 0;
      this.totalTimeTaken = '0h 0m 0s';
      this.allSelected = false;
      this.someSelected = false;
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

  convertProductsToObject():Product[] {
    return this.products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        type: product.type,
        category: product.category,
        tags: product.tags || [],
        quantity: product.quantity,
        variants: product.variants,
        selected: product.selected,
        images: product.images,
        createdDate: product.createdDate,
        visible: product.visible,
      };
    });
  }

  deductProductQuantity(product: Product) {
    let index = this.products.findIndex((item) => item.id === product.id);
    if (index > -1) {
      this.products[index].quantity -= 1;
    }
  }

  addProductQuantity(product: Product) {
    let index = this.products.findIndex((item) => item.id === product.id);
    if (index > -1) {
      this.products[index].quantity += 1;
    }
  }

  setProductQuantity(product: Product, quantity: number) {
    let index = this.products.findIndex((item) => item.id === product.id);
    if (index > -1) {
      this.products[index].quantity = quantity;
    }
  }
  
  getTime(date:Timestamp){
    let milliseconds =(new Date()).getTime() - (date.toDate().getTime());
    // convert milliseconds to minutes and seconds
    let minutes = Math.floor(milliseconds / 60000);
    let seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
  }

  calculateTotalTimeTaken() {
    setInterval(() => {
      let time = this.getTime(this.createdDate);
      this.totalTimeTaken = time;
      this.totalTimeTakenNumber = Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
    },1000)
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
    };
  }
}
