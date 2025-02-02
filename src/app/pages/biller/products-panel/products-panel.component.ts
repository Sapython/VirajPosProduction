import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import Fuse from 'fuse.js';
import { Subject, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { Product } from '../../../types/product.structure';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { Category } from '../../../types/category.structure';
import {
  Combo,
  ComboCategoryCategorized,
} from '../../../types/combo.structure';
import { ApplicableCombo } from '../../../core/constructors/comboKot/comboKot';
import { Dialog } from '@angular/cdk/dialog';
import { OpenProductComponent } from './open-product/open-product.component';
import { Timestamp } from '@angular/fire/firestore';
var debug: boolean = true;
@Component({
  selector: 'app-products-panel',
  templateUrl: './products-panel.component.html',
  styleUrls: ['./products-panel.component.scss'],
})
export class ProductsPanelComponent implements OnInit, OnDestroy {
  searcher: Fuse<any> = new Fuse([], {});
  products: Product[] = [];
  searchVisible: boolean = false;
  searchResults: Product[] = [];
  customSearchVisible: boolean = false;
  categoryProductSearchResults: Product[] = [];
  categoryComboSearchResults: Combo[] = [];
  currentCategory: Category | undefined = undefined;
  categoryWiseSearchSubject: Subject<string> = new Subject<string>();
  categoryWiseSearchedValue: string = '';
  customSearcher: Fuse<any> = new Fuse([], { keys: ['name'] });
  combos: Combo[] = [];
  mode: 'combos' | 'products' | 'types' = 'products';
  selectedCombo: Combo | undefined = undefined;
  currentlyWaitingForSearchResults: boolean = false;
  openCategory:Category={
    id:'open',
    enabled:true,
    name:'Open',
    products:[],
  }
  menuProductsSubscription:Subscription = Subscription.EMPTY;
  comboSelectedSubscription:Subscription = Subscription.EMPTY;
  searchResultsSubscription:Subscription = Subscription.EMPTY;
  modeChangedSubscription:Subscription = Subscription.EMPTY;
  selectTableSubscription:Subscription = Subscription.EMPTY;
  menuLoadedSubscription:Subscription = Subscription.EMPTY;
  categoryWiseSearchSubjectSubscription:Subscription = Subscription.EMPTY;
  categoryWiseSearchSubjectDebouncedSubscription:Subscription = Subscription.EMPTY;
  constructor(public dataProvider: DataProvider, private dialog:Dialog) {
    this.menuProductsSubscription = this.dataProvider.menuProducts.subscribe((menu: Category) => {
      if (menu){
        this.mode = 'products';
        this.products = menu.products;
        this.currentCategory = menu;
        this.combos = [];
        this.customSearcher.setCollection(this.products);
      }
    });
    this.comboSelectedSubscription = this.dataProvider.comboSelected.subscribe((combo: any) => {
      console.log('Combo Selected: ', combo);
      this.mode = 'combos';
      this.searchVisible = false;
      this.customSearchVisible = false;
      this.combos = combo;
      this.selectedCombo = undefined;
      this.currentCategory = {
        enabled: true,
        id: '',
        name: 'Combos',
        products: combo,
        averagePrice: 0,
      };
      console.log('Combo Selected: ', combo);
      this.searchResults = [];
      this.categoryProductSearchResults = [];
      // hide all other results
      this.categoryProductSearchResults = [];
      this.products = [];
      this.customSearcher.setCollection(combo);
    });
    this.searchResultsSubscription = this.dataProvider.searchResults.subscribe((results: Product[] | false) => {
      if (results) {
        this.searchResults = results;
        this.searchVisible = true;
        this.selectedCombo = undefined;
      } else {
        this.searchVisible = false;
      }
    });
    this.modeChangedSubscription = this.dataProvider.modeChanged.subscribe(() => {
      this.searchResults = [];
      this.categoryProductSearchResults = [];
      this.products = [];
      this.searchVisible = false;
      this.currentCategory = undefined;
      this.selectedCombo = undefined;
      this.combos = [];
    });
    this.selectTableSubscription = this.dataProvider.selectTable.subscribe((value) => {
      this.searchResults = [];
      this.categoryProductSearchResults = [];
      this.products = [];
      this.searchVisible = false;
      this.currentCategory = undefined;
      this.selectedCombo = undefined;
      this.combos = [];
    });
    this.menuLoadedSubscription = this.dataProvider.menuLoadSubject.subscribe((value) => {
      if (value) {
        this.searcher.setCollection(this.products);
      }
    });
    this.categoryWiseSearchSubjectSubscription = this.categoryWiseSearchSubject.subscribe(() => {this.currentlyWaitingForSearchResults=true});
    this.categoryWiseSearchSubjectDebouncedSubscription = this.categoryWiseSearchSubject
      .pipe(debounceTime(600))
      .subscribe((value) => {
        this.currentlyWaitingForSearchResults=false;
        this.categoryWiseSearchedValue = value;
        if (debug) console.log('GOT VALUE: ', value);
        if (this.mode == 'combos') {
          this.categoryProductSearchResults = [];
          this.categoryComboSearchResults = this.customSearcher
            .search(value)
            .map((result) => {
              return result.item;
            });
        } else if (this.mode == 'products') {
          this.categoryComboSearchResults = [];
          this.categoryProductSearchResults = this.customSearcher
            .search(value)
            .map((result) => {
              return result.item;
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.menuProductsSubscription.unsubscribe();
    this.comboSelectedSubscription.unsubscribe();
    this.searchResultsSubscription.unsubscribe();
    this.modeChangedSubscription.unsubscribe();
    this.selectTableSubscription.unsubscribe();
    this.menuLoadedSubscription.unsubscribe();
    this.categoryWiseSearchSubjectSubscription.unsubscribe();
    this.categoryWiseSearchSubjectDebouncedSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.searcher = new Fuse(this.products, {
      keys: ['name'],
    });
  }

  isHalf(product: Product) {
    if (product) {
      for (const tag of product.tags || []) {
        if (tag?.name?.toLocaleLowerCase() == 'half') {
          return ' Half';
        }
        if (tag?.name?.toLocaleLowerCase() == 'full') {
          return ' Full';
        }
      }
    }
    return '';
  }

  selectProduct(product: Product) {
    product = JSON.parse(JSON.stringify(product));
    product.cancelled = false;
    product.name = product.name + this.isHalf(product);
    delete product.instruction;
    product.quantity = 1;
    if (!this.dataProvider.currentTable) {
      this.dataProvider.tempProduct = product;
    }
    if (!this.dataProvider.currentTable) {
      this.dataProvider.openTableView.next(true);
      return;
    }
    if (this.dataProvider.currentBill) {
      this.dataProvider.currentBill.addProduct(product);
    } else {
      this.dataProvider.currentBill = this.dataProvider.currentTable.occupyTable();
      this.dataProvider.billAssigned.next();
      this.dataProvider.currentBill.addProduct(product);
    }
  }

  selectComboProduct(product: Product, category: ComboCategoryCategorized) {
    if (!this.dataProvider.currentBill) {
      this.dataProvider.openTableView.next(true);
      return;
    }
    console.log(
      'this.dataProvider.currentApplicableCombo?.id == this.selectedCombo?.id',
      this.dataProvider.currentApplicableCombo?.combo,
      this.selectedCombo,
    );
    if (
      this.dataProvider.currentApplicableCombo?.combo.id ==
      this.selectedCombo?.id
    ) {
      console.log('Adding to existing combo');
      this.dataProvider.currentApplicableCombo.addProduct(category, product);
    } else {
      console.log('Adding to new combo');
      this.dataProvider.currentCombo = this.selectedCombo;
      this.dataProvider.currentComboTypeCategory = category;
      this.dataProvider.currentApplicableCombo = new ApplicableCombo(
        this.selectedCombo
      );
      if (this.dataProvider.currentApplicableCombo.canBeApplied) {
        this.dataProvider.currentApplicableCombo.addProduct(category, product);
        if (this.dataProvider.currentBill) {
          this.dataProvider.currentBill.addProduct(
            this.dataProvider.currentApplicableCombo,
          );
        }
      }
    }
  }

  selectCombo(item: Combo) {
    console.log('Combo Selected: ', item);
    this.selectedCombo = item;
  }

  openItem(category:{id:string,name:string}){
    console.log("category",category);
    let dialog = this.dialog.open(OpenProductComponent);
    firstValueFrom(dialog.closed).then(async (value:any)=>{
      console.log("Value",value);
      if (!value?.name || !value?.price) return;
      let printer = await this.dataProvider.currentMenu.getDefaultPrinters();
      let product:Product = {
        name:value.name,
        price:value.price,
        specificPrinter:printer.kotPrinter,
        id:`CUSTOM-${Math.random().toString()}`,
        category:category,
        createdDate:Timestamp.fromDate(new Date()),
        images:[],
        itemType:'product',
        quantity:1,
        selected:false,
        sellByAvailable:false,
        tags:[],
        taxes:[],
        type:'veg',
        variants:[],
        visible:true,
      };
      this.selectProduct(product);
    })
  }
}
