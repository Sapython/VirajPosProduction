import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-stock-valuation',
  templateUrl: './stock-valuation.component.html',
  styleUrls: ['./stock-valuation.component.scss'],
})
export class StockValuationComponent {
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() items: Item[] = [
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Bread',
      quantity: 10,
      price: 10,
      total: 100,
    },
    {
      name: 'Cheese',
      quantity: 10,
      price: 10,
      total: 100,
    },
  ];
}
interface Item {
  name: string;
  quantity: number;
  price: number;
  total: number;
}
