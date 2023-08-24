import {
  AfterViewInit,
  Component,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { StockListComponent } from './stock-list/stock-list.component';
import { Category, ViewCategory } from '../../../../types/category.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { ModeConfig } from '../../../../core/constructors/menu/menu';
import { Combo } from '../../../../types/combo.structure';
declare var Hammer: any;
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, AfterViewInit {
  closeStockListPanelSubscription: Subject<boolean> = new Subject<boolean>();
  isStockListOpen = false;

  public recommended: Category[] = [];
  public rootCategories: Category[] = [];

  public products: any[] = [];

  currentCategory: Category | undefined = undefined;
  currentEvent: any = undefined;
  stockConsumption: number = 0;
  currentMenu: undefined | ModeConfig;
  activeIndex: string = '';
  constructor(
    public viewContainerRef: ViewContainerRef,
    private dialog: Dialog,
    public dataProvider: DataProvider,
    private indexedDb: NgxIndexedDBService,
  ) {
    this.closeStockListPanelSubscription
      .pipe(debounceTime(600))
      .subscribe((data) => {
        this.isStockListOpen = data;
      });
    this.dataProvider.menuLoadSubject.subscribe((data) => {
      // console.log("LOADED MENU",this.dataProvider.currentMenu);
      this.currentMenu = this.dataProvider.currentMenu;
      this.activeIndex = '';
    });
    this.dataProvider.modeChanged.subscribe(() => {
      // console.log("MODE CHANGED",data);
      this.currentMenu = this.dataProvider.currentMenu;
      this.activeIndex = '';
    });
    this.dataProvider.searchResults.subscribe((data) => {
      // reset selected category
      this.currentCategory = undefined;
      this.activeIndex = '';
    })
  }

  ngOnInit(): void {
    this.getDineInProducts();
    this.recommended = this.dataProvider.recommendedCategories.map(
      (recommendedCategory) => {
        return {
          name: recommendedCategory.name,
          id: recommendedCategory.id,
          products: this.dataProvider.products.filter((product) =>
            recommendedCategory.products.includes(product.id),
          ),
          averagePrice: 0,
          enabled: recommendedCategory.enabled,
        };
      },
    );
    // console.log("this.dataProvider.rootCategories",this.dataProvider.rootCategories);
    this.rootCategories = this.dataProvider.rootCategories.map(
      (rootCategory) => {
        return {
          name: rootCategory.name,
          id: rootCategory.id,
          products: this.dataProvider.products.filter(
            (product) => rootCategory.id == product.category.id,
          ),
          averagePrice: 0,
          enabled: rootCategory.enabled,
        };
      },
    );
  }

  ngAfterViewInit(): void {
    if (this.dataProvider.touchMode) {
      // stockConsumptionTrigger recognizer
      var mc = new Hammer.Manager(
        document.getElementById('stockConsumptionTrigger'),
      );
      mc.add(new Hammer.Press({ time: 500 }));
      mc.on('press', (ev: any) => {
        // console.log("press",ev);
        const dialog = this.dialog.open(StockListComponent);
        dialog.componentInstance?.close.subscribe((data) => {
          dialog.close();
        });
      });
    }
  }

  getDineInProducts() {
    this.products = [];
    this.dataProvider.categories = [];
    this.dataProvider.productsLoaded.subscribe((data) => {
      // console.log("Loaded",data);
      if (data) {
        this.dataProvider.categories = [];
        this.dataProvider.viewCategories.forEach((category: ViewCategory) => {
          let products = this.dataProvider.products.filter((product) =>
            category.products.includes(product.id),
          );
          // console.log("products",products);
          this.dataProvider.categories.push({
            id: category.id,
            name: category.name,
            products: products,
            averagePrice:
              products.reduce((a, b) => a + b.price, 0) / products.length,
            enabled: category.enabled,
          });
        });
        this.storeCategoriesIndexedDb();
      }
    });
  }

  storeCategoriesIndexedDb() {
    this.indexedDb.getAll('categories').subscribe((data) => {
      if (data.length == 0) {
        this.dataProvider.categories.forEach((category) => {
          this.indexedDb.add('categories', category);
        });
      } else {
        if (data.length > 0) {
          this.dataProvider.categories.forEach((category) => {
            firstValueFrom(this.indexedDb.update('categories', category));
          });
        }
      }
    });
    this.indexedDb.getAll('recommendedCategories').subscribe((data) => {
      if (data.length == 0) {
        this.dataProvider.recommendedCategories.forEach((category) => {
          this.indexedDb.add('recommendedCategories', category);
        });
      } else {
        if (data.length > 0) {
          this.dataProvider.recommendedCategories.forEach((category) => {
            firstValueFrom(
              this.indexedDb.update('recommendedCategories', category),
            );
          });
        }
      }
    });
  }

  async openCategory(category: Category) {
    console.log('openCategory', category);
    // reset vars of combo
    this.dataProvider.comboSelected.next(undefined);
    let state = this.dataProvider.productPanelStateValue;
    if (state == 'combos') {
      console.log('switched', state);
      this.dataProvider.productPanelState.next('products');
    }
    this.dataProvider.clearSearchField.next();
    this.dataProvider.searchResults.next(false);
    this.dataProvider.menuProducts.next(category);
  }

  async openCombo(combos: any) {
    let state = this.dataProvider.productPanelStateValue;
    if (state == 'products') {
      console.log('switched', state);
      this.dataProvider.productPanelState.next('combos');
    }
    this.dataProvider.clearSearchField.next();
    this.dataProvider.searchResults.next(false);
    console.log('openCombo', combos.combos);
    this.dataProvider.comboSelected.next(combos.combos);
    console.log('openCombo', combos);
  }
}

// create a regex for console.log( to find all console.log( in the project and end it in )
// console.log\((.*)\)
