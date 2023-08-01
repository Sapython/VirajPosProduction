import { Component } from '@angular/core';

@Component({
  selector: 'app-recommended',
  templateUrl: './recommended.component.html',
  styleUrls: ['./recommended.component.scss'],
})
export class RecommendedComponent {
  products = [
    { name: 'Product 1', price: 100 },
    { name: 'Product 2', price: 200 },
    { name: 'Product 3', price: 300 },
    { name: 'Product 4', price: 400 },
    { name: 'Product 5', price: 500 },
    { name: 'Product 6', price: 600 },
    { name: 'Product 7', price: 700 },
    { name: 'Product 8', price: 800 },
    { name: 'Product 9', price: 900 },
    { name: 'Product 10', price: 1000 },
  ];
}
