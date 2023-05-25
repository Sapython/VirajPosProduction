import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss']
})
export class StockListComponent {
  @Output() close:EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() items:Item[] = [
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Bread",
      quantity: 10,
      price: 10,
      total: 100
    },
    {
      name: "Cheese",
      quantity: 10,
      price: 10,
      total: 100
    },
  ];
}
interface Item{
  name:string;
  quantity:number;
  price:number;
  total:number;
}