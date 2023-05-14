import { Component, OnInit } from '@angular/core';
import Fuse from 'fuse.js';
import { DataProvider } from '../../provider/data-provider.service';
import { Category } from '../../structures/general.structure';
import { Product } from '../constructors';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-products-panel',
  templateUrl: './products-panel.component.html',
  styleUrls: ['./products-panel.component.scss']
})
export class ProductsPanelComponent implements OnInit{
  searcher:Fuse<any> = new Fuse([], {});
  products:Product[] = [];
  searchVisible:boolean = false;
  searchResults:Product[] = [];
  customSearchVisible:boolean = false;
  customResults:Product[] = [];
  customSearchSubject:Subject<string> = new Subject<string>();
  customSearcher:Fuse<any> = new Fuse([], {keys:['name']});
  constructor(private dataProvider:DataProvider){
    this.dataProvider.menuProducts.subscribe((menu:Category)=>{
      this.products = menu.products;
      this.customSearcher.setCollection(this.products);
    })
    this.dataProvider.searchResults.subscribe((results:Product[]|false)=>{
      if (results) {
        this.searchResults = results;
        console.log("Search Results: ",this.searchResults);
        this.searchVisible = true;
      } else {
        this.searchVisible = false;
      }
    })
    this.customSearchSubject.pipe(debounceTime(600)).subscribe((value)=>{
      this.customResults = this.customSearcher.search(value).map((result)=>{
        return result.item;
      })
      console.log("Custom Search: ",value,this.customResults);
      if (value){
        this.customSearchVisible = true;
      } else {
        this.customSearchVisible = false;
      }
    })

  }

  ngOnInit(): void {
    this.searcher = new Fuse(this.products, {
      keys:['name']
    })
  }

  selectProduct(product:Product){
    delete product.instruction
    if(!this.dataProvider.currentBill){
      this.dataProvider.tempProduct = product;
    }
    if (!this.dataProvider.currentTable){
      this.dataProvider.openTableView.next(true)
      return;
    }
    if (this.dataProvider.currentBill){
      this.dataProvider.currentBill.addProduct(JSON.parse(JSON.stringify(product)));
    }
  }
}
