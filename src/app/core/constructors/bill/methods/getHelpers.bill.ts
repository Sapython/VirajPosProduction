import { Bill } from '..';
import { Product } from '../../../../types/product.structure';

export function allProducts(this: Bill) {
  // return all products from all kots and merge with their quantity
  let products: Product[] = [];
  this.kots.forEach((kot) => {
    kot.products.forEach((product) => {
      let index = products.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        products[index].quantity += product.quantity;
      } else {
        products.push(product);
      }
    });
  });
  return products;
}

export function allFinalProducts(this: Bill) {
  let products: Product[] = [];
  this.kots.forEach((kot) => {
    if (kot.stage == 'finalized') {
      kot.products.forEach((product) => {
        let index = products.findIndex((item) => item.id === product.id);
        if (index !== -1) {
          products[index].quantity += product.quantity;
        } else {
          products.push(product);
        }
      });
    }
  });
  return products;
}

export function kotWithoutFunctions(this: Bill): any[] {
  return this.kots.map((kot) => kot.toObject());
}

export function totalProducts() {
  let total = 0;
  this.kots.forEach((kot) => {
    if (kot.stage === 'active') {
      total += kot.products.length;
    }
  });
  return total;
}
