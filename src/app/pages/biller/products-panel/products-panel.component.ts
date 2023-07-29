import { Component, OnInit } from '@angular/core';
import Fuse from 'fuse.js';
import { Subject, debounceTime } from 'rxjs';
import { Product } from '../../../types/product.structure';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { Category } from '../../../types/category.structure';
import { Combo, ComboCategoryCategorized } from '../../../types/combo.structure';
import { ApplicableCombo } from '../../../core/constructors/comboKot/comboKot';
var debug:boolean = true;
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
  categoryProductSearchResults:Product[] = [];
  categoryComboSearchResults:Combo[] = [];
  currentCategory:Category|undefined = undefined;
  categoryWiseSearchSubject:Subject<string> = new Subject<string>();
  customSearcher:Fuse<any> = new Fuse([], {keys:['name']});
  combos:Combo[] = [];
  mode:'combos'|'products'|'types' = 'products';
  selectedCombo:Combo|undefined = undefined;
  
  constructor(private dataProvider:DataProvider){
    this.dataProvider.menuProducts.subscribe((menu:Category)=>{
      this.mode = 'products';
      this.products = menu.products;
      this.currentCategory = menu;
      this.combos = [];
      this.customSearcher.setCollection(this.products);
    })
    this.dataProvider.comboSelected.subscribe((combo:any)=>{
      console.log("Combo Selected: ",combo);
      this.mode = 'combos';
      this.searchVisible = false;
      this.customSearchVisible = false;
      this.combos = combo;
      this.selectedCombo = undefined;
      this.currentCategory = {
        enabled:true,
        id:'',
        name:'Combos',
        products:combo,
        averagePrice:0,
      };
      console.log("Combo Selected: ",combo);
      this.searchResults = [];
      this.categoryProductSearchResults = [];
      // hide all other results
      this.categoryProductSearchResults = [];
      this.products = [];
      this.customSearcher.setCollection(combo);
    })
    this.dataProvider.searchResults.subscribe((results:Product[]|false)=>{
      if (results) {
        this.searchResults = results;
        this.searchVisible = true;
      } else {
        this.searchVisible = false;
      }
    })
    this.dataProvider.modeChanged.subscribe(()=>{
      this.searchResults = [];
      this.categoryProductSearchResults = [];
      this.products = [];
      this.searchVisible = false;
      this.currentCategory = undefined;
      this.combos = [];
    })
    this.dataProvider.menuLoadSubject.subscribe((value)=>{
      if (value){
        this.searcher.setCollection(this.products);
      }
    })
    this.categoryWiseSearchSubject.pipe(debounceTime(600)).subscribe((value)=>{
      if(debug) console.log("GOT VALUE: ",value);
      if (this.mode == 'combos'){
        this.categoryProductSearchResults = [];
        this.categoryComboSearchResults = this.customSearcher.search(value).map((result)=>{
          return result.item;
        })
      } else if (this.mode == 'products'){
        this.categoryComboSearchResults = [];
        this.categoryProductSearchResults = this.customSearcher.search(value).map((result)=>{
          return result.item;
        })
      }
    })

  }

  ngOnInit(): void {
    this.searcher = new Fuse(this.products, {
      keys:['name']
    })
  }

  isHalf(product:Product) {
    if (product) {
      for (const tag of product.tags || []) {
        if (tag.name.toLocaleLowerCase() == 'half') {
          return true;
        }
      }
    } else {
      return false;
    }
  }

  selectProduct(product:Product){
    product = JSON.parse(JSON.stringify(product))
    product.cancelled = false;
    product.name = product.name + (this.isHalf(product) ? ' Half' : ' Full')
    delete product.instruction
    if(!this.dataProvider.currentBill){
      this.dataProvider.tempProduct = product;
    }
    if (!this.dataProvider.currentTable){
      this.dataProvider.openTableView.next(true)
      return;
    }
    if (this.dataProvider.currentBill){
      this.dataProvider.currentBill.addProduct(product);
    }
  }

  selectComboProduct(product:Product,category:ComboCategoryCategorized){
    if (!this.dataProvider.currentBill){
      this.dataProvider.openTableView.next(true)
      return;
    }
    console.log("this.dataProvider.currentApplicableCombo?.id == this.selectedCombo?.id",this.dataProvider.currentApplicableCombo?.combo, this.selectedCombo);
    if (this.dataProvider.currentApplicableCombo?.combo.id == this.selectedCombo?.id){
      console.log("Adding to existing combo");
      this.dataProvider.currentApplicableCombo.addProduct(category,product);
    } else {
      console.log("Adding to new combo");
      this.dataProvider.currentCombo = this.selectedCombo;
      this.dataProvider.currentComboTypeCategory = category;
      this.dataProvider.currentApplicableCombo = new ApplicableCombo(this.selectedCombo,this.dataProvider.currentBill);
      if (this.dataProvider.currentApplicableCombo.canBeApplied){
        this.dataProvider.currentApplicableCombo.addProduct(category,product);
        if(this.dataProvider.currentBill){
          this.dataProvider.currentBill.addProduct(this.dataProvider.currentApplicableCombo)
        }
      }
    }
  }

  selectCombo(item:Combo){
    console.log("Combo Selected: ",item);
    this.selectedCombo = item;
  }

}
